import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { Property } from '../models/Property';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const seedBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayfinder');
    console.log('Connected to MongoDB');

    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('Cleared existing bookings');

    // Find properties and users
    const properties = await Property.find();
    const users = await User.find();

    if (properties.length === 0) {
      console.log('No properties found. Please seed properties first.');
      process.exit(1);
    }

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    // Create sample bookings
    const sampleBookings = [
      {
        property: properties[0]._id,
        user: users[0]._id,
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        guests: 4,
        totalPrice: 75000, // 3 nights * 25000
        status: 'confirmed'
      },
      {
        property: properties[1]._id,
        user: users[0]._id,
        checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        checkOut: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
        guests: 6,
        totalPrice: 45000, // 3 nights * 15000
        status: 'pending'
      },
      {
        property: properties[2]._id,
        user: users[0]._id,
        checkIn: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        checkOut: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000), // 24 days from now
        guests: 2,
        totalPrice: 24000, // 3 nights * 8000
        status: 'confirmed'
      }
    ];

    // Insert bookings
    await Booking.insertMany(sampleBookings);
    console.log('Sample bookings added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding bookings:', error);
    process.exit(1);
  }
};

seedBookings(); 