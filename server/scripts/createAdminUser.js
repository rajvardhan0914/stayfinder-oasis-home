const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model
const { User } = require('../src/models/User.ts');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'rajvardhan09gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating role to admin...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin role updated successfully');
      return;
    }

    // Hash the admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Rajvardhan_09140205!$@^', salt);

    // Create admin user
    const adminUser = new User({
      email: 'rajvardhan09gmail.com',
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
    console.log('Email: rajvardhan09gmail.com');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser(); 