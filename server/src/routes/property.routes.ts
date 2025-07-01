import express, { Request, Response } from 'express';
import { Property } from '../models/Property';
import { auth } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const isProd = process.env.NODE_ENV === 'production';
const uploadDir = isProd ? path.resolve(__dirname, '..', 'properties') : path.resolve(__dirname, '..', 'public', 'properties');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created properties upload directory:', uploadDir);
}

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// --- MULTER SETUP FOR PROPERTY IMAGES (Cloudinary) ---
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stayfinder/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'avif'],
  } as any,
});
const uploadPropertyImages = multer({ storage });

// --- NEW ENDPOINT FOR UPLOADING PROPERTY IMAGES (Cloudinary) ---
router.post('/upload-images', auth, uploadPropertyImages.array('images', 10), (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const files = req.files as Express.Multer.File[];
    // Cloudinary URLs are in file.path
    const imageUrls = files.map(file => file.path);
    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading images', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Search properties
router.get('/search', async (req: Request, res: Response) => {
  try {
    console.log('Search request received with params:', req.query);
    
    const { location, checkIn, checkOut, guests } = req.query;
    
    // Build search query
    const query: any = {};
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (guests) {
      query.maxGuests = { $gte: parseInt(guests as string) };
    }
    
    // Add date availability check if dates are provided
    if (checkIn && checkOut) {
      query['availability'] = {
        $not: {
          $elemMatch: {
            startDate: { $lte: new Date(checkOut as string) },
            endDate: { $gte: new Date(checkIn as string) }
          }
        }
      };
    }
    
    console.log('Search query:', JSON.stringify(query, null, 2));
    
    const properties = await Property.find(query)
      .populate('owner', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });
      
    console.log(`Found ${properties.length} properties`);
    
    res.json(properties);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Error searching properties', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all properties
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('=== FETCHING ALL PROPERTIES ===');
    const properties = await Property.find()
      .populate('owner', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${properties.length} properties in database`);
    
    // Return the full property objects, not just a small subset
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Error fetching properties', error });
  }
});

// Get single property
router.get('/:id', async (req: Request, res: Response) => {
  try {
    console.log('=== FETCHING SINGLE PROPERTY ===');
    console.log('Property ID:', req.params.id);
    
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName email avatar')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      });
    
    if (!property) {
      console.log('Property not found');
      return res.status(404).json({ message: 'Property not found' });
    }
    
    console.log('Property found:', property.title);
    console.log('Reviews count:', property.reviews?.length || 0);
    console.log('Reviews array type:', Array.isArray(property.reviews) ? 'Array' : typeof property.reviews);
    console.log('Reviews:', JSON.stringify(property.reviews, null, 2));
    console.log('Property rating:', property.rating);
    
    // Filter out any null reviews (invalid references)
    const propertyData = property.toObject();
    if (Array.isArray(propertyData.reviews)) {
      propertyData.reviews = propertyData.reviews.filter(r => r);
    }
    
    console.log('Final property data being sent:', JSON.stringify(propertyData, null, 2));
    
    res.json(propertyData);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Error fetching property', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Create property
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== PROPERTY CREATION START ===');
    console.log('Creating property with data:', JSON.stringify(req.body, null, 2));
    const newPropertyData = { ...req.body };

    // Transform address to location format if address is provided
    if (newPropertyData.address) {
      console.log('=== ADDRESS TRANSFORMATION ===');
      console.log('Address data received:', JSON.stringify(newPropertyData.address, null, 2));
      
      newPropertyData.location = {
        address: newPropertyData.address.street || '',
        city: newPropertyData.address.city || '',
        state: newPropertyData.address.state || '',
        country: newPropertyData.address.country || '',
        coordinates: {
          lat: 0,
          lng: 0
        }
      };
      console.log('Transformed location data:', JSON.stringify(newPropertyData.location, null, 2));
      console.log('=== ADDRESS TRANSFORMATION END ===');
      delete newPropertyData.address;
    }

    // Handle pricePerNight field
    if (newPropertyData.pricePerNight) {
      newPropertyData.price = newPropertyData.pricePerNight;
      delete newPropertyData.pricePerNight;
    }

    // Handle numberOfUnits field
    if (!newPropertyData.numberOfUnits) {
      newPropertyData.numberOfUnits = 1; // Default to 1 unit
    }

    // Ensure all required fields are present
    if (!newPropertyData.bedrooms) newPropertyData.bedrooms = 1;
    if (!newPropertyData.bathrooms) newPropertyData.bathrooms = 1;
    if (!newPropertyData.maxGuests) newPropertyData.maxGuests = 1;
    if (!newPropertyData.amenities) newPropertyData.amenities = [];
    if (!newPropertyData.images) newPropertyData.images = [];
    if (!newPropertyData.phoneNumber) newPropertyData.phoneNumber = '';

    // If no availability is specified, set a default wide range
    if (!newPropertyData.availability || newPropertyData.availability.length === 0) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100); // Available for 100 years
      newPropertyData.availability = [{ startDate, endDate }];
    }

    console.log('Final processed property data:', JSON.stringify(newPropertyData, null, 2));

    const property = new Property({
      ...newPropertyData,
      owner: req.user._id,
    });
    
    console.log('Property model created, attempting to save...');
    const savedProperty = await property.save();
    console.log('Property saved successfully with ID:', savedProperty._id);
    console.log('Saved property data:', JSON.stringify(savedProperty.toObject(), null, 2));
    console.log('=== PROPERTY CREATION END ===');
    
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error('=== PROPERTY CREATION ERROR ===');
    console.error('Error creating property:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ message: 'Error creating property', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update property
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== PROPERTY UPDATE START ===');
    console.log('Update request body:', JSON.stringify(req.body, null, 2));
    
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    // Check if user is the owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }
    
    console.log('Original property location:', JSON.stringify(property.location, null, 2));
    
    // Update fields
    if (req.body.title) property.title = req.body.title;
    if (req.body.description) property.description = req.body.description;
    if (req.body.pricePerNight) property.price = req.body.pricePerNight;
    if (req.body.price) property.price = req.body.price; // Handle both price and pricePerNight
    if (req.body.address) {
      console.log('=== UPDATE ADDRESS TRANSFORMATION ===');
      console.log('Address data received:', JSON.stringify(req.body.address, null, 2));
      
      property.location = {
        address: req.body.address.street || '',
        city: req.body.address.city || '',
        state: req.body.address.state || '',
        country: req.body.address.country || '',
        coordinates: {
          lat: 0,
          lng: 0
        }
      };
      
      // Explicitly mark the location field as modified to ensure it gets saved
      property.markModified('location');
      
      console.log('Updated location data:', JSON.stringify(property.location, null, 2));
      console.log('=== UPDATE ADDRESS TRANSFORMATION END ===');
    }
    if (req.body.location) property.location = req.body.location;
    if (req.body.images) property.images = req.body.images;
    if (req.body.amenities) property.amenities = req.body.amenities;
    if (req.body.bedrooms) property.bedrooms = req.body.bedrooms;
    if (req.body.bathrooms) property.bathrooms = req.body.bathrooms;
    if (req.body.maxGuests) property.maxGuests = req.body.maxGuests;
    if (req.body.numberOfUnits) property.numberOfUnits = req.body.numberOfUnits;
    if (req.body.type) property.type = req.body.type;
    if (req.body.availability) property.availability = req.body.availability;
    if (req.body.phoneNumber !== undefined) property.phoneNumber = req.body.phoneNumber;
    
    console.log('Property before save:', JSON.stringify(property.toObject(), null, 2));
    
    await property.save();
    
    console.log('Property after save:', JSON.stringify(property.toObject(), null, 2));
    console.log('=== PROPERTY UPDATE END ===');
    
    res.json(property);
  } catch (error) {
    console.error('=== PROPERTY UPDATE ERROR ===');
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Error updating property', error });
  }
});

// Delete property
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is the owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }
    
    await property.deleteOne();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property', error });
  }
});

export default router; 