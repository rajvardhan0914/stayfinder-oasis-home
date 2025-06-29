const mongoose = require('mongoose');
require('dotenv').config();
const { Property } = require('./src/models/Property');

async function testConnection() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayfinder');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Test if we can perform basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Database test completed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function testUpdate() {
  try {
    console.log('=== TESTING DATABASE UPDATE ===');
    
    // Find a property
    const property = await Property.findOne();
    if (!property) {
      console.log('No properties found');
      return;
    }
    
    console.log('Original property:', JSON.stringify(property.toObject(), null, 2));
    console.log('Original location:', property.location);
    
    // Update the postal code
    property.location.zipCode = '12345';
    property.markModified('location');
    
    console.log('Updated location:', property.location);
    
    // Save the property
    await property.save();
    
    console.log('Property saved successfully');
    
    // Fetch the property again to verify
    const updatedProperty = await Property.findById(property._id);
    console.log('Updated property from DB:', JSON.stringify(updatedProperty.toObject(), null, 2));
    console.log('Updated location from DB:', updatedProperty.location);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testConnection();
testUpdate(); 