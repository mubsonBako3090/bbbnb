import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Invoice Information
    billNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // Billing Period
    billingPeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    
    // Dates
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    
    // Customer Information (Denormalized for invoice)
    customerName: { type: String, required: true },
    serviceAddress: { type: String, required: true },
    accountNumber: { type: String, required: true },
    meterNumber: String,
    
    // Usage Information
    meterReading: {
      previous: { type: Number, required: true, default: 0 },
      current: { type: Number, required: true },
      consumption: { type: Number, required: true }, // kWh
    },
    
    // Charges Breakdown
    charges: [{
      description: { type: String, required: true },
      amount: { type: Number, required: true },
      rate: Number,
      units: Number,
      type: { 
        type: String, 
        enum: ['energy', 'service', 'tax', 'fee', 'penalty', 'adjustment'],
        default: 'energy'
      }
    }],
    
    // Financial Summary
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 0.05 }, // 5% VAT
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    
    // Payment Tracking
    previousBalance: { type: Number, default: 0 },
    paymentsReceived: [{
      date: { type: Date, default: Date.now },
      amount: { type: Number, required: true },
      method: { 
        type: String, 
        enum: ['card', 'bank', 'opay', 'ussd', 'cash', 'transfer'],
        required: true 
      },
      reference: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
      }
    }],
    totalPaid: { type: Number, default: 0 },
    amountDue: { type: Number, required: true },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'generated', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'disputed'],
      default: 'generated',
      index: true,
    },
    
    // Payment Info
    paidAt: Date,
    paymentMethod: String,
    paymentReference: String,
    
    // Metadata
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: Date,
    
    // Overdue tracking
    overdueDays: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 },
    
    // Dispute
    disputeReason: String,
    disputeResolved: { type: Boolean, default: false },
    
    // Invoice details
    paymentInstructions: String,
    notes: String,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for billing period string
BillSchema.virtual('period').get(function() {
  return `${this.billingPeriod.start.toLocaleDateString()} - ${this.billingPeriod.end.toLocaleDateString()}`;
});

// Virtual for days remaining
BillSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for isOverdue
BillSchema.virtual('isOverdue').get(function() {
  return this.daysRemaining < 0 && this.status !== 'paid';
});

// Pre-save middleware to generate bill number
BillSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Find the last bill number for this month
    const lastBill = await this.constructor.findOne(
      { billNumber: new RegExp(`^BILL-${year}${month}-`) },
      { billNumber: 1 },
      { sort: { billNumber: -1 } }
    );
    
    let sequence = 1;
    if (lastBill) {
      const lastSeq = parseInt(lastBill.billNumber.split('-').pop(), 10);
      sequence = lastSeq + 1;
    }
    
    this.billNumber = `BILL-${year}${month}-${String(sequence).padStart(4, '0')}`;
    
    // Generate invoice number if not exists
    if (!this.invoiceNumber) {
      this.invoiceNumber = `INV-${this.billNumber}`;
    }
  }
  
  // Calculate amount due
  this.amountDue = this.totalAmount - this.totalPaid;
  
  // Update status based on amount due
  if (this.amountDue <= 0 && this.totalAmount > 0) {
    this.status = 'paid';
    this.paidAt = new Date();
  } else if (this.amountDue > 0 && this.amountDue < this.totalAmount) {
    this.status = 'partially_paid';
  } else if (this.isOverdue) {
    this.status = 'overdue';
    this.overdueDays = Math.abs(this.daysRemaining);
  }
  
  next();
});

// Indexes
BillSchema.index({ userId: 1, status: 1 });
BillSchema.index({ dueDate: 1, status: 1 });
BillSchema.index({ 'billingPeriod.end': -1 });

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);