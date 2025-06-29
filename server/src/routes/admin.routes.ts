import express from 'express';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { Message } from '../models/Message';
import { FavoriteLog } from '../models/FavoriteLog';
import { Request, Response } from 'express';
import { DeletedUser } from '../models/DeletedUser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    console.log('Admin login attempt:', { 
      providedEmail: email, 
      adminEmailConfigured: !!adminEmail,
      adminPasswordConfigured: !!adminPassword 
    });
    
    if (!adminEmail || !adminPassword) {
      console.log('Admin configuration missing:', { 
        adminEmail: adminEmail ? 'SET' : 'NOT SET',
        adminPassword: adminPassword ? 'SET' : 'NOT SET'
      });
      return res.status(500).json({ 
        message: 'Admin configuration not found. Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.' 
      });
    }
    
    // Check if email matches admin email
    if (email !== adminEmail) {
      console.log('Email mismatch:', { provided: email, expected: adminEmail });
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Compare password (assuming it's hashed in env, if not, you should hash it)
    const isPasswordValid = await bcrypt.compare(password, adminPassword) || password === adminPassword;
    
    if (!isPasswordValid) {
      console.log('Password mismatch for admin email:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Generate JWT token for admin
    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Admin login successful for:', email);
    res.json({ 
      message: 'Admin login successful',
      token,
      email 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Admin login failed', error });
  }
});

// Admin middleware - check if user is admin
const adminAuth = async (req: any, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    const adminToken = req.headers['admin-token'];
    const adminEmail = req.headers['admin-email'];
    
    // Check for JWT token first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        if (decoded.role === 'admin') {
          req.adminEmail = decoded.email;
          return next();
        }
      } catch (jwtError) {
        // JWT verification failed, continue to legacy check
      }
    }
    
    // Legacy token check (for backward compatibility)
    const expectedAdminEmail = process.env.ADMIN_EMAIL || 'rajvardhan09@gmail.com';
    if (adminToken !== 'admin-authenticated' || adminEmail !== expectedAdminEmail) {
      return res.status(401).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Admin authentication failed' });
  }
};

// Get all users
router.get('/users', adminAuth, async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
});

// Get user by ID
router.get('/users/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find all properties owned by the user
    const userProperties = await Property.find({ owner: user._id });
    const propertyIds = userProperties.map(property => property._id);

    // Check for active bookings on user's properties
    const activeBookings = await Booking.findOne({
      property: { $in: propertyIds },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings) {
      return res.status(400).json({ 
        message: 'Cannot delete user: One or more of their properties have active bookings (pending or confirmed). Please cancel these bookings first.' 
      });
    }

    // Count all data to be deleted BEFORE deletion
    const userBookingsCount = await Booking.countDocuments({ user: user._id });
    const userReviewsCount = await Review.countDocuments({ user: user._id });
    const propertyBookingsCount = await Booking.countDocuments({ property: { $in: propertyIds } });
    const propertyReviewsCount = await Review.countDocuments({ property: { $in: propertyIds } });
    const userMessagesCount = await Message.countDocuments({ 
      $or: [{ sender: user._id }, { recipient: user._id }] 
    });
    const userFavoriteLogsCount = await FavoriteLog.countDocuments({ userId: user._id });

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

    res.json({ 
      message: 'User and all associated data deleted successfully',
      deletedData: {
        user: 1,
        properties: userProperties.length,
        userBookings: userBookingsCount,
        userReviews: userReviewsCount,
        propertyBookings: propertyBookingsCount,
        propertyReviews: propertyReviewsCount,
        messages: userMessagesCount,
        favoriteLogs: userFavoriteLogsCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error });
  }
});

// Get all properties
router.get('/properties', adminAuth, async (req: Request, res: Response) => {
  try {
    const properties = await Property.find({}).populate('owner', 'firstName lastName email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch properties', error });
  }
});

// Get property by ID
router.get('/properties/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'firstName lastName email');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch property', error });
  }
});

// Delete property
router.delete('/properties/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete property', error });
  }
});

// Get all bookings
router.get('/bookings', adminAuth, async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'firstName lastName email')
      .populate('property', 'title address');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error });
  }
});

// Get booking by ID
router.get('/bookings/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('property', 'title address');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking', error });
  }
});

// Delete booking
router.delete('/bookings/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete booking', error });
  }
});

// Get all reviews
router.get('/reviews', adminAuth, async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'firstName lastName email')
      .populate('property', 'title address');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error });
  }
});

// Get review by ID
router.get('/reviews/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('property', 'title address');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch review', error });
  }
});

// Delete review
router.delete('/reviews/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review', error });
  }
});

// Get dashboard statistics
router.get('/stats', adminAuth, async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    // Get recent activity
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
    const recentProperties = await Property.find({}).sort({ createdAt: -1 }).limit(5);
    const recentBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(5);
    
    res.json({
      stats: {
        totalUsers,
        totalProperties,
        totalBookings,
        totalReviews
      },
      recent: {
        users: recentUsers,
        properties: recentProperties,
        bookings: recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics', error });
  }
});

export default router; 