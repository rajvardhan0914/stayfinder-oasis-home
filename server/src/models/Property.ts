import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  phoneNumber: string;
  images: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  numberOfUnits: number;
  owner: mongoose.Types.ObjectId;
  rating: number;
  reviews: mongoose.Types.ObjectId[];
  cleaningFee?: number;
  availability: Array<{
    startDate: Date;
    endDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  type: 'Apartment' | 'Villa' | 'House' | 'Cabin';
}

const PropertySchema = new Schema<IProperty>(
  {
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
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    cleaningFee: { type: Number, default: 1000 },
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
  },
  { timestamps: true }
);

export const Property = mongoose.model<IProperty>('Property', PropertySchema); 