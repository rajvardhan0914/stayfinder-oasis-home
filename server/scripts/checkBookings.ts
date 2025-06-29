import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Booking } from '../src/models/Booking';
import { User } from '../src/models/User';
import { Property } from '../src/models/Property';

async function checkBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Check total bookings
    const totalBookings = await Booking.countDocuments();
    console.log(`Total bookings in database: ${totalBookings}`);

    if (totalBookings > 0) {
      // Get a sample booking with populated data
      const sampleBooking = await Booking.findOne({})
        .populate('user', 'firstName lastName email')
        .populate('property', 'title address');
      
      console.log('\nSample booking:');
      console.log(JSON.stringify(sampleBooking, null, 2));
    } else {
      console.log('\nNo bookings found in database');
      
      // Check if we have users and properties
      const totalUsers = await User.countDocuments();
      const totalProperties = await Property.countDocuments();
      console.log(`\nTotal users: ${totalUsers}`);
      console.log(`Total properties: ${totalProperties}`);
    }
    
  } catch (error) {
    console.error('Error checking bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkBookings(); 