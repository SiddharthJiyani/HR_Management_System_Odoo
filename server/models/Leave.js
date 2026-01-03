const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  
  // Leave Type
  leaveType: {
    type: String,
    enum: ['paid', 'vacation', 'annual', 'sick', 'personal', 'casual', 'unpaid', 'maternity', 'paternity', 'bereavement', 'other'],
    required: true
  },
  
  // Title/Reason
  title: {
    type: String,
    trim: true,
    default: ''
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },

  // Date Range
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Number of days
  totalDays: {
    type: Number,
    required: true
  },
  
  // Half day option
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['first-half', 'second-half', null],
    default: null
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },

  // Approval details
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  
  // Admin/HR comments
  adminComments: {
    type: String,
    trim: true,
    default: ''
  },

  // Supporting documents
  attachments: [{
    name: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Cancellation details
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    default: ''
  }

}, {
  timestamps: true
});

// Index for faster queries
leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1 });

// Pre-save middleware to calculate total days
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // If half day, set to 0.5
    if (this.isHalfDay) {
      diffDays = 0.5;
    }
    
    this.totalDays = diffDays;
  }
  next();
});

// Static method to get leave summary for an employee
leaveSchema.statics.getEmployeeLeaveSummary = async function(employeeId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  const result = await this.aggregate([
    {
      $match: {
        employee: new mongoose.Types.ObjectId(employeeId),
        status: 'approved',
        startDate: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    {
      $group: {
        _id: '$leaveType',
        totalDays: { $sum: '$totalDays' },
        count: { $sum: 1 }
      }
    }
  ]);

  const summary = {
    vacation: { used: 0, count: 0 },
    sick: { used: 0, count: 0 },
    personal: { used: 0, count: 0 },
    unpaid: { used: 0, count: 0 },
    other: { used: 0, count: 0 }
  };

  result.forEach(item => {
    if (summary[item._id]) {
      summary[item._id].used = item.totalDays;
      summary[item._id].count = item.count;
    }
  });

  return summary;
};

// Static method to check for overlapping leaves
leaveSchema.statics.checkOverlap = async function(employeeId, startDate, endDate, excludeLeaveId = null) {
  const query = {
    employee: employeeId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  };

  if (excludeLeaveId) {
    query._id = { $ne: excludeLeaveId };
  }

  const overlapping = await this.findOne(query);
  return overlapping !== null;
};

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
