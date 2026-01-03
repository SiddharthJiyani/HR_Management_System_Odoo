const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Apply for leave (Employee)
exports.applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, title, reason, startDate, endDate, isHalfDay, halfDayType } = req.body;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    // Check for overlapping leaves
    const hasOverlap = await Leave.checkOverlap(employee._id, start, end);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for these dates'
      });
    }

    // Calculate total days
    let totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (isHalfDay) {
      totalDays = 0.5;
    }

    // Map leave types to balance keys
    const leaveTypeToKey = {
      'annual': 'vacation',
      'vacation': 'vacation',
      'sick': 'sick',
      'casual': 'personal',
      'personal': 'personal',
      'maternity': 'unpaid',
      'paternity': 'unpaid',
      'unpaid': 'unpaid'
    };
    
    const leaveTypeKey = leaveTypeToKey[leaveType] || 'unpaid';
    
    if (leaveTypeKey !== 'unpaid' && employee.leaveBalance && employee.leaveBalance[leaveTypeKey] < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${employee.leaveBalance[leaveTypeKey] || 0} days`
      });
    }

    // Create leave request
    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      title,
      reason,
      startDate: start,
      endDate: end,
      totalDays,
      isHalfDay: isHalfDay || false,
      halfDayType: halfDayType || null
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave request'
    });
  }
};

// Get my leave requests (Employee)
exports.getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, year, page = 1, limit = 20 } = req.query;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Build query
    const query = { employee: employee._id };
    
    if (status) {
      query.status = status;
    }

    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const skip = (page - 1) * limit;

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Leave.countDocuments(query)
    ]);

    // Get leave balance from employee
    const leaveBalance = employee.leaveBalance || {
      annual: 20,
      sick: 10,
      casual: 5,
      maternity: 0,
      paternity: 0,
      unpaid: 0
    };

    // Get used leaves for current year
    const currentYear = new Date().getFullYear();
    const leaveSummary = await Leave.getEmployeeLeaveSummary(employee._id, currentYear);

    res.status(200).json({
      success: true,
      data: leaves,
      leaveBalance: {
        annual: { 
          total: leaveBalance.vacation || 20, 
          used: leaveSummary.vacation?.used || 0, 
          remaining: (leaveBalance.vacation || 20) - (leaveSummary.vacation?.used || 0)
        },
        sick: { 
          total: leaveBalance.sick || 10, 
          used: leaveSummary.sick?.used || 0, 
          remaining: (leaveBalance.sick || 10) - (leaveSummary.sick?.used || 0)
        },
        casual: { 
          total: leaveBalance.personal || 5, 
          used: leaveSummary.personal?.used || 0, 
          remaining: (leaveBalance.personal || 5) - (leaveSummary.personal?.used || 0)
        }
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests'
    });
  }
};

// Cancel leave request (Employee)
exports.cancelLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Find leave
    const leave = await Leave.findOne({
      _id: id,
      employee: employee._id
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Leave request is already cancelled'
      });
    }

    if (leave.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a rejected leave request'
      });
    }

    // If leave was approved, restore balance
    if (leave.status === 'approved') {
      const leaveTypeKey = leave.leaveType === 'vacation' ? 'vacation' : 
                          leave.leaveType === 'sick' ? 'sick' : 
                          leave.leaveType === 'personal' ? 'personal' : null;
      
      if (leaveTypeKey) {
        employee.leaveBalance[leaveTypeKey] += leave.totalDays;
        await employee.save();
      }
    }

    leave.status = 'cancelled';
    leave.cancelledAt = new Date();
    leave.cancellationReason = reason || '';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request'
    });
  }
};

// Get all leave requests (HR/Admin)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, department, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build employee filter
    const employeeQuery = { status: 'active' };
    if (department) {
      employeeQuery.department = department;
    }
    const employees = await Employee.find(employeeQuery).select('_id');
    const employeeIds = employees.map(e => e._id);

    // Build leave query
    const query = { employee: { $in: employeeIds } };
    
    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    const [leaves, total, pendingCount] = await Promise.all([
      Leave.find(query)
        .populate('employee', 'firstName lastName email employeeId department designation profilePhoto')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Leave.countDocuments(query),
      Leave.countDocuments({ ...query, status: 'pending' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        leaves,
        pendingCount,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests'
    });
  }
};

// Approve/Reject leave (HR/Admin)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const approver = req.user;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const leave = await Leave.findById(id).populate('employee');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot ${status} a leave that is already ${leave.status}`
      });
    }

    // Update leave status
    leave.status = status;
    leave.adminComments = comments || '';

    if (status === 'approved') {
      leave.approvedBy = approver.id;
      leave.approvedAt = new Date();

      // Deduct from leave balance
      const employee = leave.employee;
      const leaveTypeKey = leave.leaveType === 'vacation' ? 'vacation' : 
                          leave.leaveType === 'sick' ? 'sick' : 
                          leave.leaveType === 'personal' ? 'personal' : null;
      
      if (leaveTypeKey && employee.leaveBalance[leaveTypeKey] >= leave.totalDays) {
        employee.leaveBalance[leaveTypeKey] -= leave.totalDays;
        await employee.save();
      }
    } else {
      leave.rejectedBy = approver.id;
      leave.rejectedAt = new Date();
    }

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leave
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave status'
    });
  }
};

// Get leave statistics (HR/Admin)
exports.getLeaveStats = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31);

    const [pendingLeaves, leavesByType, leavesByMonth] = await Promise.all([
      Leave.countDocuments({ status: 'pending' }),
      Leave.aggregate([
        {
          $match: {
            status: 'approved',
            startDate: { $gte: startOfYear, $lte: endOfYear }
          }
        },
        {
          $group: {
            _id: '$leaveType',
            count: { $sum: 1 },
            totalDays: { $sum: '$totalDays' }
          }
        }
      ]),
      Leave.aggregate([
        {
          $match: {
            status: 'approved',
            startDate: { $gte: startOfYear, $lte: endOfYear }
          }
        },
        {
          $group: {
            _id: { $month: '$startDate' },
            count: { $sum: 1 },
            totalDays: { $sum: '$totalDays' }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        pendingLeaves,
        byType: leavesByType,
        byMonth: leavesByMonth,
        year: targetYear
      }
    });
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave statistics'
    });
  }
};
