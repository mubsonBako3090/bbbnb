import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Bill Information
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
    index: true,
  },
  
  // Payment Details
  paymentNumber: {
    type: String,
    unique: true,
    required: true,
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD', 'EUR'],
  },
  
  // Payment Method
  method: {
    type: String,
    required: true,
    enum: ['card', 'bank', 'opay', 'ussd', 'cash', 'transfer', 'cheque'],
  },
  
  // Method Details (varies by method)
  methodDetails: {
    // For card payments
    card: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
    },
    
    // For bank transfers
    bank: {
      name: String,
      accountNumber: String,
      reference: String,
    },
    
    // For mobile money
    mobile: {
      provider: String,
      phoneNumber: String,
      transactionId: String,
    },
    
    // For USSD
    ussd: {
      code: String,
      reference: String,
    },
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true,
  },
  
  // Gateway Response
  gateway: {
    name: String, // 'stripe', 'paystack', 'flutterwave'
    transactionId: String,
    reference: String,
    responseCode: String,
    responseMessage: String,
    authorizationUrl: String, // For redirect payments
  },
  
  // Dates
  initiatedAt: {
    type: Date,
    default: Date.now,
  },
  
  completedAt: Date,
  
  failedAt: Date,
  
  // Receipt
  receiptNumber: String,
  receiptUrl: String,
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  
  // Refund Information
  refundedAmount: {
    type: Number,
    default: 0,
  },
  
  refundReason: String,
  
  refundedAt: Date,
  
  // Notes
  notes: String,
  
  // Security
  verified: {
    type: Boolean,
    default: false,
  },
  
}, { timestamps: true });

// Indexes
PaymentSchema.index({ paymentNumber: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ 'gateway.transactionId': 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to generate payment number
PaymentSchema.pre('save', async function(next) {
  if (!this.paymentNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find last payment of the day
    const lastPayment = await this.constructor.findOne(
      { paymentNumber: new RegExp(`^PAY-${year}${month}${day}-`) },
      { paymentNumber: 1 },
      { sort: { paymentNumber: -1 } }
    );
    
    let sequence = 1;
    if (lastPayment) {
      const lastSeq = parseInt(lastPayment.paymentNumber.split('-').pop(), 10);
      sequence = lastSeq + 1;
    }
    
    this.paymentNumber = `PAY-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
  }
  
  // Generate receipt number if payment is completed
  if (this.status === 'completed' && !this.receiptNumber) {
    this.receiptNumber = `RCPT-${this.paymentNumber}`;
  }
  
  next();
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);