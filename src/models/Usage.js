import mongoose from 'mongoose';

const UsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  meterNumber: {
    type: String,
    required: true,
  },
  
  readingDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  
  // Usage Data
  readingType: {
    type: String,
    enum: ['manual', 'auto', 'estimated'],
    default: 'manual',
  },
  
  currentReading: {
    type: Number,
    required: true,
    min: 0,
  },
  
  previousReading: {
    type: Number,
    required: true,
    min: 0,
  },
  
  consumption: {
    type: Number,
    required: true,
    min: 0, // kWh
  },
  
  // For time-of-use rates
  peakConsumption: {
    type: Number,
    default: 0,
  },
  
  offPeakConsumption: {
    type: Number,
    default: 0,
  },
  
  // Rate Information
  ratePlan: {
    type: String,
    enum: ['residential', 'commercial', 'industrial'],
    default: 'residential',
  },
  
  rateApplied: {
    type: Number,
    required: true,
  }, // per kWh
  
  // Bill Link
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    default: null,
  },
  
  // Metadata
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  verified: {
    type: Boolean,
    default: false,
  },
  
  notes: String,
  
}, { timestamps: true });

// Indexes
UsageSchema.index({ userId: 1, readingDate: -1 });
UsageSchema.index({ meterNumber: 1, readingDate: -1 });

// Virtual for reading period
UsageSchema.virtual('period').get(function() {
  const date = new Date(this.readingDate);
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
});

export default mongoose.models.Usage || mongoose.model('Usage', UsageSchema);