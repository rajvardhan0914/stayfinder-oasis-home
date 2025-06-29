import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../src/models/User';

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const email = 'rajvardhan09@gmail.com';
    const password = 'Rajvardhan_09140205!$@^';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user already exists. Updating role and password...');
      existingAdmin.role = 'admin';
      existingAdmin.password = await bcrypt.hash(password, 10);
      await existingAdmin.save();
      console.log('Admin user updated successfully');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = new User({
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      preferences: {
        language: 'en',
        currency: 'INR',
        notifications: {
          email: true,
          sms: true,
          marketing: false,
        },
        privacy: {
          profileVisibility: 'private',
          showEmail: false,
          showPhone: false,
        },
      },
    });
    await adminUser.save();
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser(); 