const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// Check In
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { location, method } = req.body;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (attendance && attendance.checkIn?.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today',
        data: attendance
      });
    }

    const checkInTime = new Date();
    const isLate = checkInTime.getHours() >= 10; // Late if after 10 AM

    if (attendance) {
      // Update existing record
      attendance.checkIn = {
        time: checkInTime,
        location: location || 'Office',
        method: method || 'web'
      };
      attendance.status = isLate ? 'late' : 'present';
    } else {
      // Create new attendance record
      attendance = new Attendance({
        employee: employee._id,
        date: today,
        checkIn: {
          time: checkInTime,
          location: location || 'Office',
          method: method || 'web'
        },
        status: isLate ? 'late' : 'present'
      });
    }

    await attendance.save();

    // Update employee's current attendance status
    employee.currentAttendanceStatus = attendance.status;
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in'
    });
  }
};

// Check Out
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const { location, method } = req.body;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (!attendance || !attendance.checkIn?.time) {
      return res.status(400).json({
        success: false,
        message: 'You have not checked in today'
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today',
        data: attendance
      });
    }

    attendance.checkOut = {
      time: new Date(),
      location: location || 'Office',
      method: method || 'web'
    };

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out'
    });
  }
};

// Get my attendance (for logged-in employee)
exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year, page = 1, limit = 31 } = req.query;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Build date range
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const [attendance, summary] = await Promise.all([
      Attendance.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 }),
      Attendance.getEmployeeSummary(employee._id, startDate, endDate)
    ]);

    // Format records for frontend - include checkIn/checkOut times directly
    const formattedRecords = attendance.map(record => ({
      _id: record._id,
      date: record.date,
      checkIn: record.checkIn?.time || null,
      checkOut: record.checkOut?.time || null,
      status: record.status,
      totalHours: record.totalHours,
      overtimeHours: record.overtimeHours,
      note: record.note
    }));

    res.status(200).json({
      success: true,
      data: formattedRecords,
      summary,
      month: targetMonth + 1,
      year: targetYear
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
};

// Get today's attendance status
exports.getTodayStatus = async (req, res) => {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    res.status(200).json({
      success: true,
      data: {
        isCheckedIn: !!attendance?.checkIn?.time,
        isCheckedOut: !!attendance?.checkOut?.time,
        checkInTime: attendance?.checkIn?.time || null,
        checkOutTime: attendance?.checkOut?.time || null,
        status: attendance?.status || 'not-checked-in',
        totalHours: attendance?.totalHours || 0
      }
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s status'
    });
  }
};

// Get all employees attendance (HR/Admin only)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, department, status, page = 1, limit = 50 } = req.query;

    // Build date
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get all active employees
    const employeeQuery = { status: 'active' };
    if (department) {
      employeeQuery.department = department;
    }

    const employees = await Employee.find(employeeQuery).select('firstName lastName email employeeId department designation profilePhoto');

    // Get attendance for all employees for the date
    const attendanceRecords = await Attendance.find({
      date: targetDate
    });

    // Create a map for quick lookup using employee ID string
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      if (record.employee) {
        attendanceMap.set(record.employee.toString(), record);
      }
    });

    // Combine employees with their attendance - format for frontend
    const result = employees.map(emp => {
      const attendance = attendanceMap.get(emp._id.toString());
      const fullName = `${emp.firstName} ${emp.lastName}`.trim();
      
      return {
        employeeId: emp._id,
        employeeName: fullName,
        department: emp.department,
        designation: emp.designation,
        avatar: emp.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FFD966&color=000&size=150`,
        date: targetDate.toISOString().split('T')[0],
        checkIn: attendance?.checkIn?.time || null,
        checkOut: attendance?.checkOut?.time || null,
        status: attendance?.status || 'not-checked-in',
        totalHours: attendance?.totalHours || 0,
        overtimeHours: attendance?.overtimeHours || 0
      };
    });

    // Filter by status if provided
    let filteredResult = result;
    if (status) {
      filteredResult = result.filter(item => {
        if (status === 'not-checked-in') {
          return !item.checkIn;
        }
        return item.status === status;
      });
    }

    // Calculate stats
    const stats = {
      total: employees.length,
      present: result.filter(r => r.status === 'present').length,
      absent: result.filter(r => r.status === 'absent').length,
      leave: result.filter(r => r.status === 'leave').length,
      late: result.filter(r => r.status === 'late').length,
      notCheckedIn: result.filter(r => !r.checkIn).length
    };

    res.status(200).json({
      success: true,
      data: filteredResult,
      stats,
      date: targetDate
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records'
    });
  }
};

// Get employee attendance (HR/Admin can view any, employee can view own)
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    const requestingUser = req.user;

    // Get employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check authorization
    if (requestingUser.role === 'employee') {
      const userEmployee = await Employee.findOne({ user: requestingUser.id });
      if (!userEmployee || userEmployee._id.toString() !== employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this attendance'
        });
      }
    }

    // Build date range
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const [attendance, summary] = await Promise.all([
      Attendance.find({
        employee: employeeId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 }),
      Attendance.getEmployeeSummary(employeeId, startDate, endDate)
    ]);

    res.status(200).json({
      success: true,
      data: {
        employee: {
          _id: employee._id,
          name: employee.name,
          employeeId: employee.employeeId,
          department: employee.department
        },
        records: attendance,
        summary,
        month: targetMonth + 1,
        year: targetYear
      }
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
};

// Mark attendance (HR/Admin only - for manual marking)
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, note } = req.body;
    const markedBy = req.user.id;

    // Get employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: attendanceDate
    });

    if (attendance) {
      // Update existing
      attendance.status = status;
      if (checkIn) attendance.checkIn = { time: new Date(checkIn), method: 'manual' };
      if (checkOut) attendance.checkOut = { time: new Date(checkOut), method: 'manual' };
      attendance.note = note || '';
      attendance.markedBy = markedBy;
    } else {
      // Create new
      attendance = new Attendance({
        employee: employeeId,
        date: attendanceDate,
        status,
        checkIn: checkIn ? { time: new Date(checkIn), method: 'manual' } : undefined,
        checkOut: checkOut ? { time: new Date(checkOut), method: 'manual' } : undefined,
        note: note || '',
        markedBy
      });
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance'
    });
  }
};
// Get attendance for a week (HR/Admin)
exports.getWeekAttendance = async (req, res) => {
  try {
    const { startDate: startDateStr, department } = req.query;

    // Calculate week start and end
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    // Get start of week (Monday)
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(startDate);
    weekStart.setDate(diff);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get employees
    const employeeQuery = { status: 'active' };
    if (department) {
      employeeQuery.department = department;
    }

    const employees = await Employee.find(employeeQuery)
      .select('firstName lastName email employeeId department designation profilePhoto');

    // Get attendance for the week
    const attendanceRecords = await Attendance.find({
      date: { $gte: weekStart, $lte: weekEnd }
    });

    // Create a map for quick lookup
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      const key = `${record.employee.toString()}_${record.date.toISOString().split('T')[0]}`;
      attendanceMap.set(key, record);
    });

    // Generate week days
    const weekDays = [];
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      weekDays.push(new Date(d).toISOString().split('T')[0]);
    }

    // Combine employees with their weekly attendance
    const result = employees.map(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.trim();
      const weeklyAttendance = {};
      
      weekDays.forEach(day => {
        const key = `${emp._id.toString()}_${day}`;
        const attendance = attendanceMap.get(key);
        weeklyAttendance[day] = {
          checkIn: attendance?.checkIn?.time || null,
          checkOut: attendance?.checkOut?.time || null,
          status: attendance?.status || 'not-checked-in',
          totalHours: attendance?.totalHours || 0
        };
      });

      return {
        employeeId: emp._id,
        employeeName: fullName,
        department: emp.department,
        avatar: emp.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FFD966&color=000&size=150`,
        weeklyAttendance
      };
    });

    res.status(200).json({
      success: true,
      data: result,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      weekDays
    });
  } catch (error) {
    console.error('Get week attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch week attendance'
    });
  }
};

// Get monthly attendance summary (HR/Admin)
exports.getMonthSummary = async (req, res) => {
  try {
    const { month, year, department } = req.query;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Get employees
    const employeeQuery = { status: 'active' };
    if (department) {
      employeeQuery.department = department;
    }

    const employees = await Employee.find(employeeQuery)
      .select('firstName lastName email employeeId department designation profilePhoto');

    // Get attendance summary for each employee
    const summaries = await Promise.all(
      employees.map(async (emp) => {
        const summary = await Attendance.getEmployeeSummary(emp._id, startDate, endDate);
        const fullName = `${emp.firstName} ${emp.lastName}`.trim();
        
        return {
          employeeId: emp._id,
          employeeName: fullName,
          department: emp.department,
          avatar: emp.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FFD966&color=000&size=150`,
          ...summary
        };
      })
    );

    // Calculate overall stats
    const overallStats = summaries.reduce((acc, s) => ({
      totalPresent: acc.totalPresent + s.present,
      totalAbsent: acc.totalAbsent + s.absent,
      totalLeave: acc.totalLeave + s.leave,
      totalLate: acc.totalLate + s.late,
      totalHours: acc.totalHours + s.totalHours
    }), { totalPresent: 0, totalAbsent: 0, totalLeave: 0, totalLate: 0, totalHours: 0 });

    res.status(200).json({
      success: true,
      data: summaries,
      stats: overallStats,
      month: targetMonth + 1,
      year: targetYear
    });
  } catch (error) {
    console.error('Get month summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch month summary'
    });
  }
};

// Request attendance regularization (Employee)
exports.requestRegularization = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, reason, checkIn, checkOut } = req.body;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance exists
    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: attendanceDate
    });

    if (!attendance) {
      // Create new attendance record with regularization request
      attendance = new Attendance({
        employee: employee._id,
        date: attendanceDate,
        status: 'absent',
        isRegularized: false,
        regularizationReason: reason,
        regularizationRequest: {
          requestedCheckIn: checkIn ? new Date(checkIn) : null,
          requestedCheckOut: checkOut ? new Date(checkOut) : null,
          status: 'pending',
          requestedAt: new Date()
        }
      });
    } else {
      // Update existing attendance with regularization request
      attendance.isRegularized = false;
      attendance.regularizationReason = reason;
      attendance.regularizationRequest = {
        requestedCheckIn: checkIn ? new Date(checkIn) : null,
        requestedCheckOut: checkOut ? new Date(checkOut) : null,
        status: 'pending',
        requestedAt: new Date()
      };
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Regularization request submitted successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Request regularization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit regularization request'
    });
  }
};

// Approve/Reject regularization (HR/Admin)
exports.handleRegularization = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { action, comments } = req.body; // action: 'approve' | 'reject'
    const approvedBy = req.user.id;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (!attendance.regularizationRequest) {
      return res.status(400).json({
        success: false,
        message: 'No regularization request found'
      });
    }

    if (action === 'approve') {
      // Apply the requested times
      if (attendance.regularizationRequest.requestedCheckIn) {
        attendance.checkIn = {
          time: attendance.regularizationRequest.requestedCheckIn,
          method: 'manual'
        };
      }
      if (attendance.regularizationRequest.requestedCheckOut) {
        attendance.checkOut = {
          time: attendance.regularizationRequest.requestedCheckOut,
          method: 'manual'
        };
      }
      attendance.status = 'present';
      attendance.isRegularized = true;
      attendance.regularizationRequest.status = 'approved';
    } else {
      attendance.regularizationRequest.status = 'rejected';
    }

    attendance.regularizationRequest.approvedBy = approvedBy;
    attendance.regularizationRequest.approvedAt = new Date();
    attendance.regularizationRequest.comments = comments || '';

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Regularization ${action}d successfully`,
      data: attendance
    });
  } catch (error) {
    console.error('Handle regularization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process regularization'
    });
  }
};

// Get pending regularization requests (HR/Admin)
exports.getPendingRegularizations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const attendance = await Attendance.find({
      'regularizationRequest.status': 'pending'
    })
      .populate('employee', 'firstName lastName email employeeId department')
      .sort({ 'regularizationRequest.requestedAt': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments({
      'regularizationRequest.status': 'pending'
    });

    const formattedData = attendance.map(record => ({
      _id: record._id,
      employee: {
        _id: record.employee._id,
        name: `${record.employee.firstName} ${record.employee.lastName}`,
        email: record.employee.email,
        employeeId: record.employee.employeeId,
        department: record.employee.department
      },
      date: record.date,
      currentStatus: record.status,
      requestedCheckIn: record.regularizationRequest?.requestedCheckIn,
      requestedCheckOut: record.regularizationRequest?.requestedCheckOut,
      reason: record.regularizationReason,
      requestedAt: record.regularizationRequest?.requestedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending regularizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regularization requests'
    });
  }
};