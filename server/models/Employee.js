const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  // Reference to User for authentication
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  profilePhoto: {
    type: String,
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },

  // Employment Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Engineering', 'Product', 'Design', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations', 'Analytics', 'General', 'Other'],
    default: 'Other'
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['employee', 'hr', 'admin'],
    default: 'employee'
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
    default: 'Full-time'
  },
  joinDate: {
    type: Date,
    required: [true, 'Join date is required'],
    default: Date.now
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'terminated'],
    default: 'active'
  },
  currentAttendanceStatus: {
    type: String,
    enum: ['present', 'absent', 'leave', 'not-checked-in', 'half-day'],
    default: 'not-checked-in'
  },

  // Emergency Contact
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  },

  // Documents
  documents: [{
    name: { type: String },
    type: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Leave Balance
  leaveBalance: {
    vacation: { type: Number, default: 20 },
    sick: { type: Number, default: 10 },
    personal: { type: Number, default: 5 },
    unpaid: { type: Number, default: 0 }
  },

  // Salary Information (visible only to HR/Admin)
  salary: {
    basic: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },

  // Bank Details
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountHolderName: { type: String, default: '' }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
employeeSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
employeeSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return [addr.street, addr.city, addr.state, addr.zipCode, addr.country]
    .filter(Boolean)
    .join(', ');
});

// Index for faster queries
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
