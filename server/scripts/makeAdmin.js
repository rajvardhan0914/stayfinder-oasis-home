const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const { User } = require('../src/models/User');

async function makeUserAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    // Update the user's role to admin
    user.role = 'admin';
    await user.save();

    console.log(`Successfully made ${user.firstName} ${user.lastName} (${email}) an admin`);
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node makeAdmin.js <email>');
  console.log('Example: node makeAdmin.js admin@example.com');
  process.exit(1);
}

makeUserAdmin(email); 