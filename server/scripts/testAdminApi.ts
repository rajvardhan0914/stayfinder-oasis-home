import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Booking } from '../src/models/Booking';
import { User } from '../src/models/User';
import { Property } from '../src/models/Property';

async function testAdminApi() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Test the same query that the admin API uses
    const bookings = await Booking.find({})
      .populate('user', 'firstName lastName email')
      .populate('property', 'title address');
    
    console.log(`Found ${bookings.length} bookings`);
    
    if (bookings.length > 0) {
      console.log('\nFirst booking:');
      console.log(JSON.stringify(bookings[0], null, 2));
      
      // Check if status field exists
      console.log('\nStatus field check:');
      bookings.forEach((booking, index) => {
        console.log(`Booking ${index + 1}: status = ${booking.status || 'undefined'}`);
      });
    }
    
  } catch (error) {
    console.error('Error testing admin API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAdminApi(); 