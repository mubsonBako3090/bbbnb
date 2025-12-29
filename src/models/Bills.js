import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  paidAt: { type: Date, default: Date.now }
});

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true },

  billingPeriod: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },

  dueDate: { type: Date, required: true },

  energyUsage: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, default: 0.15 },
  energyCharge: { type: Number, required: true },

  serviceFee: { type: Number, default: 15.0 },
  taxes: { type: Number, default: 0 },

  totalAmount: { type: Number, required: true },
  amountDue: { type: Number, required: true },

  previousBalance: { type: Number, default: 0 },

  payments: [paymentHistorySchema],   // Full history support

  status: {
    type: String,
    enum: ['pending', 'partially_paid', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },

  paidAt: { type: Date },

  paymentMethod: {
    type: String,
    enum: [
      'credit_card',
      'debit_card',
      'bank_transfer',
      'cash',
      'ussd',
      'opay'
    ],
    default: null
  },

  meterReadings: {
    previous: { type: Number, required: true, min: 0 },
    current: { type: Number, required: true, min: 0 }
  },

  notes: { type: String, maxlength: 500 }
}, { timestamps: true });

billSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Bill || mongoose.model('Bill', billSchema);
