import mongoose from 'mongoose';
import { Property } from '../models/Property';
import { Review } from '../models/Review';
import dotenv from 'dotenv';

dotenv.config();

const migrateReviews = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayfinder');
    console.log('Connected to MongoDB');

    // Find all properties with embedded reviews
    const properties = await Property.find({ 'reviews.0': { $exists: true } });
    console.log(`Found ${properties.length} properties with embedded reviews`);

    for (const property of properties) {
      console.log(`Processing property: ${property.title}`);
      
      // Check if reviews are embedded (old format)
      if (property.reviews && Array.isArray(property.reviews) && property.reviews.length > 0) {
        const firstReview = property.reviews[0];
        
        // Check if it's an embedded review (has user, rating, comment properties)
        if (typeof firstReview === 'object' && 'user' in firstReview && 'rating' in firstReview && 'comment' in firstReview) {
          console.log(`Migrating ${property.reviews.length} reviews for property: ${property.title}`);
          
          // Create Review documents for each embedded review
          const reviewPromises = property.reviews.map(async (embeddedReview: any) => {
            const review = new Review({
              property: property._id,
              user: embeddedReview.user,
              rating: embeddedReview.rating,
              comment: embeddedReview.comment,
              createdAt: embeddedReview.date || new Date(),
              updatedAt: embeddedReview.date || new Date()
            });
            return review.save();
          });
          
          await Promise.all(reviewPromises);
          
          // Get the IDs of the newly created reviews
          const newReviews = await Review.find({ property: property._id });
          const reviewIds = newReviews.map(review => review._id);
          
          // Update the property to reference the new reviews
          await Property.findByIdAndUpdate(property._id, {
            reviews: reviewIds
          });
          
          console.log(`Successfully migrated reviews for property: ${property.title}`);
        }
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateReviews();
}

export default migrateReviews; 