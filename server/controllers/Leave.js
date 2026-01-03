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
      'paid': 'vacation',
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

    // Generate title if not provided
    const leaveTitle = title || `${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave Request`;

    // Create leave request
    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      title: leaveTitle,
      reason: reason || '',
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

// Get leave balance (Employee)
exports.getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get leave balance from employee
    const leaveBalance = employee.leaveBalance || {
      vacation: 24,
      sick: 10,
      personal: 5
    };

    // Get used leaves for current year
    const currentYear = new Date().getFullYear();
    const leaveSummary = await Leave.getEmployeeLeaveSummary(employee._id, currentYear);

    res.status(200).json({
      success: true,
      data: {
        paid: {
          total: leaveBalance.vacation || 24,
          used: leaveSummary.vacation?.used || 0,
          remaining: (leaveBalance.vacation || 24) - (leaveSummary.vacation?.used || 0)
        },
        sick: {
          total: leaveBalance.sick || 10,
          used: leaveSummary.sick?.used || 0,
          remaining: (leaveBalance.sick || 10) - (leaveSummary.sick?.used || 0)
        },
        unpaid: {
          total: 0,
          used: leaveSummary.unpaid?.used || 0,
          remaining: 0
        }
      }
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave balance'
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
    const { status, department, startDate, endDate, page = 1, limit = 50 } = req.query;

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

    // Format for frontend - return flat array with employee info included
    const formattedLeaves = leaves.map(leave => ({
      _id: leave._id,
      employeeId: leave.employee,
      startDate: leave.startDate,
      endDate: leave.endDate,
      leaveType: leave.leaveType,
      status: leave.status,
      totalDays: leave.totalDays,
      reason: leave.reason,
      title: leave.title,
      adminComments: leave.adminComments,
      createdAt: leave.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedLeaves,
      pendingCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
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

    console.log('Updating leave status:', { id, status, comments, approverId: approver?.id });

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    // Find the leave request first
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    console.log('Found leave:', { leaveId: leave._id, employeeId: leave.employee, leaveType: leave.leaveType, totalDays: leave.totalDays });

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

      // Try to update employee balance, but don't fail the approval if it fails
      try {
        const employee = await Employee.findById(leave.employee);
        
        if (employee) {
          console.log('Found employee:', { employeeId: employee._id, currentBalance: employee.leaveBalance });
          
          // Initialize leaveBalance if it doesn't exist
          if (!employee.leaveBalance) {
            employee.leaveBalance = {
              vacation: 20,
              sick: 10,
              personal: 5,
              unpaid: 0
            };
          }
          
          // Map leave types to balance keys
          const leaveTypeToKey = {
            'paid': 'vacation',
            'annual': 'vacation',
            'vacation': 'vacation',
            'sick': 'sick',
            'casual': 'personal',
            'personal': 'personal',
            'maternity': 'unpaid',
            'paternity': 'unpaid',
            'unpaid': 'unpaid'
          };
          
          const leaveTypeKey = leaveTypeToKey[leave.leaveType];
          console.log('Leave type mapping:', { leaveType: leave.leaveType, leaveTypeKey });
          
          // Deduct balance only for paid leave types
          if (leaveTypeKey && leaveTypeKey !== 'unpaid') {
            // Ensure the balance field exists
            if (typeof employee.leaveBalance[leaveTypeKey] !== 'number') {
              employee.leaveBalance[leaveTypeKey] = leaveTypeKey === 'vacation' ? 20 : leaveTypeKey === 'sick' ? 10 : 5;
            }
            
            // Check if sufficient balance
            if (employee.leaveBalance[leaveTypeKey] >= leave.totalDays) {
              employee.leaveBalance[leaveTypeKey] -= leave.totalDays;
              
              // Mark leaveBalance as modified (needed for nested objects)
              employee.markModified('leaveBalance');
              
              // Use findByIdAndUpdate to avoid full validation
              await Employee.findByIdAndUpdate(
                employee._id,
                { $set: { leaveBalance: employee.leaveBalance } },
                { runValidators: false }
              );
              console.log('Balance deducted successfully:', { newBalance: employee.leaveBalance[leaveTypeKey] });
            } else {
              console.warn(`Warning: Insufficient leave balance. Available: ${employee.leaveBalance[leaveTypeKey]}, Requested: ${leave.totalDays}`);
            }
          }
        } else {
          console.warn('Employee not found for leave request, but still approving leave');
        }
      } catch (empError) {
        // Log the error but don't fail the approval
        console.error('Error updating employee balance:', empError.message);
        console.error('Continuing with leave approval...');
      }
    } else {
      leave.rejectedBy = approver.id;
      leave.rejectedAt = new Date();
    }

    await leave.save();
    console.log('Leave saved successfully with status:', leave.status);

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leave
    });
  } catch (error) {
    console.error('Update leave status error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave status',
      error: error.message
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
