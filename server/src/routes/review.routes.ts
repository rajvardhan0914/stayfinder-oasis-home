import express from 'express';
import { Review } from '../models/Review';
import { Property } from '../models/Property';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// Add a review to a property
router.post('/', auth, async (req: any, res) => {
  try {
    console.log('=== CREATING REVIEW ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);
    
    const { propertyId, rating, comment } = req.body;
    
    // Check if user already reviewed this property
    const existingReview = await Review.findOne({ 
      property: propertyId, 
      user: req.user._id 
    });
    
    if (existingReview) {
      console.log('User already reviewed this property');
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }
    
    // Check if user is not the property owner
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('Property not found:', propertyId);
      return res.status(404).json({ message: 'Property not found' });
    }
    
    if (property.owner.toString() === req.user._id.toString()) {
      console.log('User is property owner, cannot review');
      return res.status(400).json({ message: 'You cannot review your own property' });
    }
    
    console.log('Creating new review...');
    const review = new Review({
      property: propertyId,
      user: req.user._id,
      rating,
      comment
    });
    await review.save();
    console.log('Review saved with ID:', review._id);
    
    // Add review to property
    await Property.findByIdAndUpdate(propertyId, { $push: { reviews: review._id } });
    console.log('Review added to property');
    
    // Verify the review was added
    const updatedProperty = await Property.findById(propertyId);
    console.log('Property reviews after adding:', updatedProperty?.reviews);
    
    // Calculate new average rating
    const allReviews = await Review.find({ property: propertyId });
    const averageRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
    console.log('New average rating:', averageRating);
    
    // Update property rating
    await Property.findByIdAndUpdate(propertyId, { rating: averageRating });
    console.log('Property rating updated');
    
    // Verify property still has the review
    const updatedPropertyAfterUpdate = await Property.findById(propertyId);
    console.log('Property reviews after update:', updatedPropertyAfterUpdate?.reviews);
    
    // Populate user info for response
    await review.populate('user', 'firstName lastName');
    console.log('Review populated with user info');
    
    console.log('=== REVIEW CREATED SUCCESSFULLY ===');
    res.status(201).json({
      ...review.toObject(),
      newAverageRating: averageRating
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// Get reviews for a property
router.get('/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Get user's review for a specific property
router.get('/user/:propertyId', auth, async (req: any, res) => {
  try {
    console.log('=== CHECKING USER REVIEW ===');
    console.log('Property ID:', req.params.propertyId);
    console.log('User ID:', req.user._id);
    
    const review = await Review.findOne({ 
      property: req.params.propertyId, 
      user: req.user._id 
    }).populate('user', 'firstName lastName');
    
    console.log('Found review:', review);
    
    res.json({ review });
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({ message: 'Failed to fetch user review' });
  }
});

// Update a review
router.put('/:reviewId', auth, async (req: any, res) => {
  try {
    console.log('=== UPDATING REVIEW ===');
    console.log('Review ID:', req.params.reviewId);
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);
    
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      console.log('Review not found:', req.params.reviewId);
      return res.status(404).json({ message: 'Review not found' });
    }
    
    console.log('Found review:', review);
    
    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      console.log('User not authorized to update this review');
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    console.log('Updating review...');
    review.rating = rating;
    review.comment = comment;
    await review.save();
    console.log('Review updated successfully');
    
    // Calculate new average rating
    const allReviews = await Review.find({ property: review.property });
    const averageRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
    console.log('New average rating:', averageRating);
    
    // Update property rating
    await Property.findByIdAndUpdate(review.property, { rating: averageRating });
    console.log('Property rating updated');
    
    // Verify property still has the review
    const updatedProperty = await Property.findById(review.property);
    console.log('Property reviews after update:', updatedProperty?.reviews);
    
    // Populate user info for response (only once)
    await review.populate('user', 'firstName lastName');
    console.log('Review populated with user info');
    
    console.log('=== REVIEW UPDATED SUCCESSFULLY ===');
    console.log('Returning review:', review.toObject());
    
    res.json({
      ...review.toObject(),
      newAverageRating: averageRating
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req: any, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    const propertyId = review.property;
    await Review.findByIdAndDelete(req.params.reviewId);
    
    // Remove review from property
    await Property.findByIdAndUpdate(propertyId, { $pull: { reviews: req.params.reviewId } });
    
    // Calculate new average rating
    const remainingReviews = await Review.find({ property: propertyId });
    const averageRating = remainingReviews.length > 0 
      ? remainingReviews.reduce((sum, rev) => sum + rev.rating, 0) / remainingReviews.length 
      : 0;
    
    // Update property rating
    await Property.findByIdAndUpdate(propertyId, { rating: averageRating });
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

export default router;