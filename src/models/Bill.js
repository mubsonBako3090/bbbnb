import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  billNumber: String,
  billingPeriod: {
    start: Date,
    end: Date
  },
  dueDate: Date,
  energyUsage: Number,
  rate: Number,
  energyCharge: Number,
  serviceFee: Number,
  taxes: Number,
  totalAmount: Number,
  amountDue: Number,
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paidAt: Date
}, { timestamps: true });

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);
