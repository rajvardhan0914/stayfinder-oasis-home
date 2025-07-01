import express from 'express';
import { auth } from '../middleware/auth.middleware';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { FavoriteLog } from '../models/FavoriteLog';
import { PasswordChangeLog } from '../models/PasswordChangeLog';
import { DeletedUser } from '../models/DeletedUser';
import { Review } from '../models/Review';
import { Message } from '../models/Message';
import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import { Property } from '../models/Property';
import { Booking } from '../models/Booking';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const router = express.Router();

const isProd = process.env.NODE_ENV === 'production';
const avatarUploadDir = isProd ? path.resolve(__dirname, '..', 'avatars') : path.resolve(__dirname, '..', 'public', 'avatars');

// Ensure the upload directory exists
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
  console.log('Created avatars upload directory:', avatarUploadDir);
}

// Multer setup for avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stayfinder/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'avif'],
  } as any,
});
const uploadAvatar = multer({ storage: avatarStorage });

// Get current user's profile
router.get('/profile', auth, async (req: any, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phoneNumber,
    avatar: user.avatar,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    preferences: user.preferences,
    twoFactorEnabled: user.twoFactorEnabled,
    isVerified: user.isVerified,
    favorites: user.favorites
  });
});

// Get user's favorites
router.get('/favorites', auth, async (req: any, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.favorites);
});

// Add to favorites
router.post('/favorites/:propertyId', auth, async (req: any, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.favorites.map(id => id.toString()).includes(req.params.propertyId)) {
    user.favorites.push(req.params.propertyId);
    await user.save();
    // Log the favorite action
    await FavoriteLog.create({
      userId: user._id,
      propertyId: req.params.propertyId,
      action: 'add'
    });
  }
  const populatedUser = await User.findById(user._id).populate('favorites');
  if (!populatedUser) return res.status(404).json({ message: 'User not found' });
  res.json(populatedUser.favorites);
});

// Remove from favorites
router.delete('/favorites/:propertyId', auth, async (req: any, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.favorites = user.favorites.filter(
    (id) => id.toString() !== req.params.propertyId
  );
  await user.save();
  // Log the unfavorite action
  await FavoriteLog.create({
    userId: user._id,
    propertyId: req.params.propertyId,
    action: 'remove'
  });
  const populatedUser = await User.findById(user._id).populate('favorites');
  if (!populatedUser) return res.status(404).json({ message: 'User not found' });
  res.json(populatedUser.favorites);
});

// Update current user's profile
router.put('/profile', auth, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update basic fields
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phone || user.phoneNumber;
    user.avatar = req.body.avatar || user.avatar;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.address = req.body.address || user.address;

    // Update preferences and privacy
    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences,
        notifications: {
          ...user.preferences?.notifications,
          ...req.body.preferences.notifications,
        },
        privacy: {
          ...user.preferences?.privacy,
          ...req.body.preferences.privacy,
        },
      };
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error });
  }
});

// Change password
router.post('/change-password', auth, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    // Log the password change
    await PasswordChangeLog.create({
      userId: user._id,
      ip: req.ip
    });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password', error });
  }
});

// Toggle 2FA
router.post('/toggle-2fa', auth, async (req: any, res) => {
  try {
    const { enabled } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.twoFactorEnabled = !!enabled;
    await user.save();
    res.json({ message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update 2FA setting', error });
  }
});

// Upload avatar endpoint
router.post('/upload-avatar', auth, uploadAvatar.single('avatar'), async (req: any, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const avatarUrl = req.file.path; // Cloudinary URL
  await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
  res.json({ avatarUrl });
});

// GET /api/users/my-properties - Get properties created by the logged-in user
router.get('/my-properties', auth, async (req: any, res: Response) => {
    try {
        const properties = await Property.find({ owner: req.user._id });
        // Always return an array, even if empty
        res.json(properties || []);
    } catch (error) {
        console.error('Error in my-properties route:', error);
        res.status(500).json({ message: 'Server error while fetching user properties.' });
    }
});

// DELETE /users/delete-account - Permanently delete the current user's account
router.delete('/delete-account', auth, async (req: any, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // Find all properties owned by the user
    const properties = await Property.find({ owner: user._id });
    const propertyIds = properties.map((p: any) => p._id);
    
    // Check for running bookings (pending or confirmed) on any property
    const runningBooking = await Booking.findOne({
      property: { $in: propertyIds },
      status: { $in: ['pending', 'confirmed'] }
    });
    if (runningBooking) {
      return res.status(400).json({ message: 'Cannot delete account: One or more of your properties have bookings that are pending or confirmed.' });
    }

    // Log deleted user info for audit/history
    await DeletedUser.create({
      originalId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      deletedAt: new Date(),
      data: user.toObject()
    });

    // Delete all messages sent or received by the user
    await Message.deleteMany({ 
      $or: [{ sender: user._id }, { recipient: user._id }] 
    });

    // Delete all favorite logs by the user
    await FavoriteLog.deleteMany({ userId: user._id });

    // Delete all bookings made by the user
    await Booking.deleteMany({ user: user._id });

    // Delete all reviews written by the user
    await Review.deleteMany({ user: user._id });

    // Delete all bookings for properties owned by the user
    await Booking.deleteMany({ property: { $in: propertyIds } });

    // Delete all reviews for properties owned by the user
    await Review.deleteMany({ property: { $in: propertyIds } });

    // Delete all properties owned by the user
    await Property.deleteMany({ owner: user._id });

    // Finally, delete the user
    await User.deleteOne({ _id: user._id });
    
    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error });
  }
});

export default router; 