import mongoose, { Document, Schema } from 'mongoose';

export interface IPasswordChangeLog extends Document {
  userId: mongoose.Types.ObjectId;
  changedAt: Date;
  ip?: string;
}

const PasswordChangeLogSchema = new Schema<IPasswordChangeLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
  ip: { type: String }
});

export const PasswordChangeLog = mongoose.model<IPasswordChangeLog>('PasswordChangeLog', PasswordChangeLogSchema); 