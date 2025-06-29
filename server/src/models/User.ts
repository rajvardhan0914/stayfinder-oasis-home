import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'host' | 'admin';
  avatar?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  favorites: mongoose.Types.ObjectId[];
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisibility: string;
      showEmail: boolean;
      showPhone: boolean;
    };
  };
  twoFactorEnabled: boolean;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['user', 'host', 'admin'], default: 'user' },
    avatar: { type: String },
    phoneNumber: { type: String },
    isVerified: { type: Boolean, default: false },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    preferences: {
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'INR' },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      privacy: {
        profileVisibility: { type: String, default: 'public' },
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
      },
    },
    twoFactorEnabled: { type: Boolean, default: false },
    dateOfBirth: { type: Date },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema); 