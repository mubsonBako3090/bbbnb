import mongoose from 'mongoose';

const meterRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meterType: {
    type: String,
    enum: ['smart', 'analog', 'digital'],
    required: true
  },
  meterNumber: {
    type: String,
    required: true,
    unique: true
  },
  preferredInstallationDate: {
    type: Date,
    required: true
  },
  meterLocation: {
    type: String,
    enum: ['front', 'back', 'side', 'basement'],
    required: true
  },
  propertyAccess: {
    type: String,
    enum: ['yes', 'gate', 'key', 'other'],
    required: true
  },
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  estimatedInstallationDate: {
    type: Date,
    required: true
  },
  actualInstallationDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  assignedTechnician: {
    name: String,
    id: mongoose.Schema.Types.ObjectId,
    contact: String
  },
  installationNotes: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: String,
    enum: ['customer', 'admin', 'system'],
    default: 'customer'
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true
});

// Index for faster queries
meterRequestSchema.index({ userId: 1, status: 1 });
meterRequestSchema.index({ status: 1, priority: -1 });
meterRequestSchema.index({ estimatedInstallationDate: 1 });

export default mongoose.models.MeterRequest || mongoose.model('MeterRequest', meterRequestSchema);