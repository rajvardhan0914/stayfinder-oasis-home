import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  message: string;
  propertyId: mongoose.Types.ObjectId;
  bookingId: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  bookingId: {
    type: Schema.Types.Mixed,
    ref: 'Booking',
    required: false,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
MessageSchema.index({ bookingId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, recipient: 1 });
MessageSchema.index({ bookingId: 1, createdAt: 1 }); // For ascending order queries

export const Message = mongoose.model<IMessage>('Message', MessageSchema); 