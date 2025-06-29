import mongoose, { Document, Schema } from 'mongoose';

export interface IFavoriteLog extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  action: 'add' | 'remove';
  createdAt: Date;
}

const FavoriteLogSchema = new Schema<IFavoriteLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  action: { type: String, enum: ['add', 'remove'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export const FavoriteLog = mongoose.model<IFavoriteLog>('FavoriteLog', FavoriteLogSchema); 