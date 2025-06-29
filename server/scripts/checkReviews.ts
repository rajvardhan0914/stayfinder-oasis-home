import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Review } from '../src/models/Review';
import { User } from '../src/models/User';
import { Property } from '../src/models/Property';

async function checkReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Check total reviews
    const totalReviews = await Review.countDocuments();
    console.log(`Total reviews in database: ${totalReviews}`);

    if (totalReviews > 0) {
      // Get a sample review with populated data
      const sampleReview = await Review.findOne({})
        .populate('user', 'firstName lastName email')
        .populate('property', 'title address');
      
      console.log('\nSample review:');
      console.log(JSON.stringify(sampleReview, null, 2));
    } else {
      console.log('\nNo reviews found in database');
    }
    
  } catch (error) {
    console.error('Error checking reviews:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkReviews(); 