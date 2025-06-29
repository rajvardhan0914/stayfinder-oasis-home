import mongoose from 'mongoose';

const DeletedUserSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  email: String,
  firstName: String,
  lastName: String,
  deletedAt: { type: Date, default: Date.now },
  data: Object // Store the full user object for audit/history
});

export const DeletedUser = mongoose.models.DeletedUser || mongoose.model('DeletedUser', DeletedUserSchema); 