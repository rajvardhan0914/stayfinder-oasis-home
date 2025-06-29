import mongoose from 'mongoose';
import { Property } from '../models/Property';
import { Review } from '../models/Review';
import dotenv from 'dotenv';

dotenv.config();

const cleanupReviews = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayfinder');
    console.log('Connected to MongoDB');

    // Find all properties
    const properties = await Property.find({});
    console.log(`Found ${properties.length} properties`);

    for (const property of properties) {
      console.log(`Processing property: ${property.title}`);
      
      if (property.reviews && Array.isArray(property.reviews)) {
        // Check if any review references are invalid
        const validReviewIds = [];
        
        for (const reviewId of property.reviews) {
          try {
            const review = await Review.findById(reviewId);
            if (review) {
              validReviewIds.push(reviewId);
            } else {
              console.log(`Removing invalid review reference: ${reviewId}`);
            }
          } catch (error) {
            console.log(`Error checking review ${reviewId}:`, error);
          }
        }
        
        // Update property with only valid review references
        if (validReviewIds.length !== property.reviews.length) {
          await Property.findByIdAndUpdate(property._id, {
            reviews: validReviewIds
          });
          console.log(`Updated property ${property.title}: ${property.reviews.length} -> ${validReviewIds.length} reviews`);
        }
      }
    }
    
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupReviews();
}

export default cleanupReviews; 