// models/Customer.js
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  meterNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  meterInstallationStatus: {
    type: String,
    enum: ['pending', 'approved', 'installed', 'active', 'faulty', 'disconnected'],
    default: 'pending'
  },
  installationDate: Date,
  meterType: {
    type: String,
    enum: ['smart', 'digital', 'analog']
  },
  consumptionHistory: [{
    date: Date,
    reading: Number,
    units: { type: String, default: 'kWh' }
  }],
  billingInfo: {
    tariffPlan: String,
    paymentMethod: String,
    lastPaymentDate: Date,
    outstandingBalance: { type: Number, default: 0 }
  },
  zone: String,
  assignedFieldAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'closed', 'pending'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
