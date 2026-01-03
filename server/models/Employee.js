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
    enum: ['present', 'absent', 'leave', 'not-checked-in', 'half-day', 'late'],
    default: 'not-checked-in'
  },

  // Emergency Contact
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  },

  // Resume Information (Employee can edit)
  about: {
    type: String,
    default: '',
    maxlength: 2000
  },
  skills: [{
    name: { type: String },
    proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
    yearsOfExperience: { type: Number, default: 0 }
  }],
  certifications: [{
    name: { type: String },
    issuingOrganization: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    credentialId: { type: String, default: '' },
    credentialUrl: { type: String, default: '' }
  }],
  interests: {
    type: String,
    default: '',
    maxlength: 1000
  },

  // Private Information (Employee can edit personal details)
  nationality: {
    type: String,
    default: ''
  },
  personalEmail: {
    type: String,
    default: '',
    lowercase: true,
    trim: true
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Other', ''],
    default: ''
  },
  dateOfJoining: {
    type: Date
  },
  residingAddress: {
    type: String,
    default: ''
  },

  // Bank Details (Employee can edit)
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    panNo: { type: String, default: '' },
    uanNo: { type: String, default: '' },
    empCode: { type: String, default: '' }
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

  // Working Schedule
  workingSchedule: {
    workingDaysPerWeek: { type: Number, default: 5 },
    breakTimeHours: { type: Number, default: 1 }
  },

  // Salary Information (Admin can edit, Employee/HR can view)
  salary: {
    // Wage Type
    wageType: { type: String, enum: ['Fixed', 'Hourly'], default: 'Fixed' },
    
    // Monthly and Yearly wage
    monthlyWage: { type: Number, default: 0 },
    yearlyWage: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },

    // Salary Components (Admin only can edit)
    components: {
      basicSalary: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 50 }, // % of monthly wage
        description: { type: String, default: 'Basic Salary forms the primary component of salary structure.' }
      },
      houseRentAllowance: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 50 }, // % of basic
        description: { type: String, default: 'HRA is provided to employees to cover their rental expenses.' }
      },
      standardAllowance: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 16.67 }, // % of basic
        description: { type: String, default: 'A standard allowance is a predetermined, fixed amount provided to employees as part of their salary.' }
      },
      performanceBonus: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 8.33 }, // % of basic
        description: { type: String, default: 'Variable amount based on performance. This value defined is the maximum amount that can be calculated as a % of the basic salary.' }
      },
      leaveTravelAllowance: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 8.333 }, // % of basic
        description: { type: String, default: 'LTA is paid by the company to employees to cover their travel expenses, and calculated as a % of the basic salary.' }
      },
      fixedAllowance: {
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 11.67 }, // % of basic
        description: { type: String, default: 'Fixed allowance portion of wages is determined after calculating all salary components.' }
      }
    },

    // Provident Fund & Tax Deductions (Admin only can edit)
    deductions: {
      providentFund: {
        employee: {
          amount: { type: Number, default: 0 },
          percentage: { type: Number, default: 12 } // % of basic
        },
        employer: {
          amount: { type: Number, default: 0 },
          percentage: { type: Number, default: 12 } // % of basic
        },
        description: { type: String, default: 'PF is calculated based on the basic salary.' }
      },
      professionalTax: {
        amount: { type: Number, default: 0 },
        description: { type: String, default: 'Professional Tax deducted from the Gross salary.' }
      }
    },

    // Total calculations (auto-calculated)
    grossSalary: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 }
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

// Pre-save middleware to auto-calculate salary components
employeeSchema.pre('save', function(next) {
  if (this.isModified('salary.monthlyWage') || this.isModified('salary.components')) {
    const monthlyWage = this.salary.monthlyWage || 0;
    
    // Calculate yearly wage
    this.salary.yearlyWage = monthlyWage * 12;

    // Calculate component amounts based on percentages
    const components = this.salary.components;
    
    // Basic Salary
    components.basicSalary.amount = Math.round((monthlyWage * components.basicSalary.percentage) / 100);
    
    const basicAmount = components.basicSalary.amount;
    
    // HRA (percentage of basic)
    components.houseRentAllowance.amount = Math.round((basicAmount * components.houseRentAllowance.percentage) / 100);
    
    // Standard Allowance (percentage of basic)
    components.standardAllowance.amount = Math.round((basicAmount * components.standardAllowance.percentage) / 100);
    
    // Performance Bonus (percentage of basic)
    components.performanceBonus.amount = Math.round((basicAmount * components.performanceBonus.percentage) / 100);
    
    // Leave Travel Allowance (percentage of basic)
    components.leaveTravelAllowance.amount = Math.round((basicAmount * components.leaveTravelAllowance.percentage) / 100);
    
    // Fixed Allowance (percentage of basic)
    components.fixedAllowance.amount = Math.round((basicAmount * components.fixedAllowance.percentage) / 100);

    // Calculate PF
    this.salary.deductions.providentFund.employee.amount = Math.round((basicAmount * this.salary.deductions.providentFund.employee.percentage) / 100);
    this.salary.deductions.providentFund.employer.amount = Math.round((basicAmount * this.salary.deductions.providentFund.employer.percentage) / 100);

    // Calculate totals
    this.salary.grossSalary = monthlyWage;
    this.salary.totalDeductions = this.salary.deductions.providentFund.employee.amount + (this.salary.deductions.professionalTax.amount || 0);
    this.salary.netSalary = this.salary.grossSalary - this.salary.totalDeductions;
  }
  next();
});

// Index for faster queries
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
