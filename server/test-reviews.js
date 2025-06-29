const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stayfinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testReviews() {
  try {
    console.log('=== TESTING REVIEWS ===');
    
    // Define schemas inline for testing
    const ReviewSchema = new mongoose.Schema({
      property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true, minlength: 1 }
    }, { timestamps: true });
    
    const PropertySchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        coordinates: {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
        },
      },
      phoneNumber: { type: String },
      images: [{ type: String }],
      amenities: [{ type: String }],
      bedrooms: { type: Number, required: true },
      bathrooms: { type: Number, required: true },
      maxGuests: { type: Number, required: true },
      numberOfUnits: { type: Number, default: 1 },
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, default: 0 },
      reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
      availability: {
        type: [{
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true }
        }],
        default: []
      },
      type: {
        type: String,
        enum: ['Apartment', 'Villa', 'House', 'Cabin'],
        required: true,
      },
    }, { timestamps: true });
    
    const Review = mongoose.model('Review', ReviewSchema);
    const Property = mongoose.model('Property', PropertySchema);
    
    // Check all properties
    const properties = await Property.find().populate('reviews');
    console.log(`Found ${properties.length} properties`);
    
    properties.forEach((property, index) => {
      console.log(`\nProperty ${index + 1}: ${property.title}`);
      console.log(`- ID: ${property._id}`);
      console.log(`- Rating: ${property.rating}`);
      console.log(`- Reviews count: ${property.reviews?.length || 0}`);
      if (property.reviews && property.reviews.length > 0) {
        property.reviews.forEach((review, reviewIndex) => {
          console.log(`  Review ${reviewIndex + 1}: ${review.comment} (Rating: ${review.rating})`);
        });
      }
    });
    
    // Check all reviews
    const reviews = await Review.find().populate('user', 'firstName lastName').populate('property', 'title');
    console.log(`\nFound ${reviews.length} reviews in Review collection`);
    
    reviews.forEach((review, index) => {
      console.log(`\nReview ${index + 1}:`);
      console.log(`- ID: ${review._id}`);
      console.log(`- Property: ${review.property?.title || 'Unknown'}`);
      console.log(`- User: ${review.user?.firstName} ${review.user?.lastName || 'Unknown'}`);
      console.log(`- Rating: ${review.rating}`);
      console.log(`- Comment: ${review.comment}`);
      console.log(`- Created: ${review.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error testing reviews:', error);
  } finally {
    mongoose.connection.close();
  }
}

testReviews(); 