import mongoose from 'mongoose';
import { Property } from '../models/Property';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

// Get today's date and 6 months from now
const today = new Date();
today.setHours(0, 0, 0, 0); // Reset time to start of day

const sixMonthsFromNow = new Date(today);
sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

// Format dates as ISO strings
const formatDate = (date: Date) => date.toISOString().split('T')[0];

// Log the dates for verification
console.log('Today:', formatDate(today));
console.log('Six months from now:', formatDate(sixMonthsFromNow));

const sampleProperties = [
  {
    title: "Luxury Villa in Goa",
    description: "Experience paradise in this stunning beachfront villa in North Goa. Enjoy private pool access, direct beach access, and breathtaking ocean views. Perfect for family vacations or group getaways.",
    price: 25000, // INR per night
    type: "Villa",
    location: {
      city: "Goa",
      state: "Goa",
      country: "India",
      address: "North Goa Beach Road, Candolim",
      coordinates: {
        lat: 15.4989,
        lng: 73.8278
      }
    },
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop"
    ],
    amenities: ["WiFi", "Pool", "Beach Access", "AC", "Kitchen", "TV"],
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    numberOfUnits: 1,
    rating: 4.9,
    reviews: [],
    availability: [
      {
        startDate: formatDate(today),
        endDate: formatDate(sixMonthsFromNow)
      }
    ]
  },
  {
    title: "Heritage Haveli in Jaipur",
    description: "Stay in this beautifully restored 19th-century haveli in the heart of Jaipur. Experience royal Rajasthani hospitality with modern amenities. Located near City Palace and Hawa Mahal.",
    price: 15000, // INR per night
    type: "House",
    location: {
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      address: "Hawa Mahal Road, Pink City",
      coordinates: {
        lat: 26.9124,
        lng: 75.7873
      }
    },
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop"
    ],
    amenities: ["WiFi", "Garden", "Traditional Decor", "AC", "Restaurant", "Spa"],
    bedrooms: 6,
    bathrooms: 4,
    maxGuests: 12,
    numberOfUnits: 1,
    rating: 4.8,
    reviews: [],
    availability: [
      {
        startDate: formatDate(today),
        endDate: formatDate(sixMonthsFromNow)
      }
    ]
  },
  {
    title: "Mountain View Cottage in Manali",
    description: "Cozy wooden cottage with panoramic views of the Himalayas. Perfect for nature lovers and adventure seekers. Enjoy trekking, skiing, and local Himachali cuisine.",
    price: 8000, // INR per night
    type: "Cabin",
    location: {
      city: "Manali",
      state: "Himachal Pradesh",
      country: "India",
      address: "Old Manali Road, Near Hadimba Temple",
      coordinates: {
        lat: 32.2432,
        lng: 77.1892
      }
    },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
    ],
    amenities: ["WiFi", "Fireplace", "Mountain View", "Kitchen", "Garden"],
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    numberOfUnits: 1,
    rating: 4.7,
    reviews: [],
    availability: [
      {
        startDate: formatDate(today),
        endDate: formatDate(sixMonthsFromNow)
      }
    ]
  }
];

const seedProperties = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayfinder');
    console.log('Connected to MongoDB');

    // Clear existing properties
    await Property.deleteMany({});
    console.log('Cleared existing properties');

    // Find a user to be the owner
    const user = await User.findOne();
    if (!user) {
      console.log('No user found. Please create a user first.');
      process.exit(1);
    }

    // Add owner to properties
    const propertiesWithOwner = sampleProperties.map(property => ({
      ...property,
      owner: user._id
    }));

    // Insert properties
    await Property.insertMany(propertiesWithOwner);
    console.log('Sample properties added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding properties:', error);
    process.exit(1);
  }
};

seedProperties(); 