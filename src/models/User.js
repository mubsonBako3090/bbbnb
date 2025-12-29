// Updated models user.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function (v) {
        return /^\+?\d{7,15}$/.test(v.replace(/\s|-/g, ''));
      },
      message: 'Please provide a valid phone number'
    }
  },
  address: {
    street: { type: String, required: [true, 'Street address is required'] },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, required: [true, 'State is required'] },
    zipCode: { type: String, required: [true, 'ZIP code is required'] },
    country: { type: String, default: 'US' }
  },
  accountNumber: { type: String, unique: true, sparse: true },
  meterNumber: { type: String, unique: true, sparse: true },
  customerType: { type: String, enum: ['residential', 'commercial'], default: 'residential' },
  role: { type: String, enum: ['customer', 'admin', 'superAdmin'], default: 'customer' },
  isStaff: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  permissions: [{
    type: String,
    enum: [
      'view_dashboard',
      'view_customers',
      'manage_customers',
      'approve_meters',
      'bulk_operations',
      'view_billing',
      'manage_billing',
      'process_payments',
      'generate_reports',
      'view_users',
      'manage_users',
      'assign_roles',
      'view_audit_logs',
      'view_system_health',
      'manage_system',
      'send_notifications',
      'all_permissions'
    ]
  }],
  lastActivity: { type: Date },
  loginSessions: [{
    token: String,
    ipAddress: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: Boolean
  }],
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    paperlessBilling: { type: Boolean, default: false }
  },
  meterType: { type: String, enum: ['smart', 'analog', 'digital', null], default: null },
  meterInstallationStatus: { type: String, enum: ['pending','assigned','installed','active','inactive'], default: 'pending' },
  meterRequestDate: Date,
  meterInstallationDate: Date,
  meterLocation: { type: String, enum: ['front','back','side','basement','unknown'], default: 'unknown' },
  meterReadings: [{
    date: Date,
    reading: Number,
    type: { type: String, enum: ['initial','regular','final'] },
    submittedBy: String,
    notes: String
  }],
  lastMeterReading: { date: Date, value: Number },
  nextMeterReadingDate: { type: Date, default: () => new Date(Date.now() + 30*24*60*60*1000) }
}, { timestamps: true });

// Pre-save hooks
userSchema.pre('save', function(next) {
  if (this.isNew) {
    if (!this.accountNumber) this.accountNumber = 'ACC' + Math.floor(Date.now()/10);
    if (!this.meterNumber) this.meterNumber = 'MTR' + Math.random().toString(36).substr(2,8).toUpperCase();
  }
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.email) this.email = this.email.toLowerCase();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Methods
userSchema.methods.correctPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.lastActivity = new Date();
  return this.save({ validateBeforeSave: false });
};

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
