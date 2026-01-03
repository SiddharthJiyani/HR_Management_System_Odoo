const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  
  // Check-in/Check-out times
  checkIn: {
    time: { type: Date },
    location: { type: String, default: 'Office' },
    method: { type: String, enum: ['manual', 'biometric', 'web'], default: 'web' }
  },
  checkOut: {
    time: { type: Date },
    location: { type: String, default: 'Office' },
    method: { type: String, enum: ['manual', 'biometric', 'web'], default: 'web' }
  },

  // Status
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave', 'holiday', 'weekend', 'late'],
    default: 'absent'
  },

  // Work hours
  totalHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },

  // Break time
  breakDuration: {
    type: Number, // in minutes
    default: 0
  },

  // Notes
  note: {
    type: String,
    trim: true,
    default: ''
  },

  // Marked by (for manual entries by HR)
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // For regularization requests
  isRegularized: {
    type: Boolean,
    default: false
  },
  regularizationReason: {
    type: String,
    default: ''
  }

}, {
  timestamps: true
});

// Compound index for unique attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

// Pre-save middleware to calculate total hours
attendanceSchema.pre('save', function(next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    const checkIn = new Date(this.checkIn.time);
    const checkOut = new Date(this.checkOut.time);
    const diffMs = checkOut - checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);
    this.totalHours = Math.round((diffHours - (this.breakDuration / 60)) * 100) / 100;
    
    // Calculate overtime (anything over 8 hours)
    if (this.totalHours > 8) {
      this.overtimeHours = Math.round((this.totalHours - 8) * 100) / 100;
    }
  }
  next();
});

// Static method to get attendance summary for an employee
attendanceSchema.statics.getEmployeeSummary = async function(employeeId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        employee: new mongoose.Types.ObjectId(employeeId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalHours: { $sum: '$totalHours' }
      }
    }
  ]);

  const summary = {
    present: 0,
    absent: 0,
    leave: 0,
    late: 0,
    halfDay: 0,
    totalHours: 0,
    avgHours: 0
  };

  result.forEach(item => {
    if (item._id === 'present') {
      summary.present = item.count;
      summary.totalHours += item.totalHours;
    } else if (item._id === 'absent') {
      summary.absent = item.count;
    } else if (item._id === 'leave') {
      summary.leave = item.count;
    } else if (item._id === 'late') {
      summary.late = item.count;
      summary.totalHours += item.totalHours;
    } else if (item._id === 'half-day') {
      summary.halfDay = item.count;
      summary.totalHours += item.totalHours;
    }
  });

  const workDays = summary.present + summary.late + summary.halfDay;
  summary.avgHours = workDays > 0 ? Math.round((summary.totalHours / workDays) * 10) / 10 : 0;

  return summary;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
