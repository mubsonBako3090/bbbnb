import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // ⚡ faster queries
    },

    billNumber: {
      type: String,
      unique: true,
      index: true,
    },

    billingPeriod: {
      start: Date,
      end: Date,
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
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
      index: true,
    },

    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Bill ||
  mongoose.model('Bill', BillSchema);
