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

    res.status(200).json({
      success: true,
      data: {
        records: attendance,
        summary,
        month: targetMonth + 1,
        year: targetYear
      }
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
    }).populate('employee', 'firstName lastName email employeeId department designation profilePhoto');

    // Create a map for quick lookup
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.employee._id.toString(), record);
    });

    // Combine employees with their attendance
    const result = employees.map(emp => {
      const attendance = attendanceMap.get(emp._id.toString());
      return {
        employee: emp,
        attendance: attendance || {
          status: 'not-checked-in',
          checkIn: null,
          checkOut: null,
          totalHours: 0
        }
      };
    });

    // Filter by status if provided
    let filteredResult = result;
    if (status) {
      filteredResult = result.filter(item => {
        if (status === 'not-checked-in') {
          return !item.attendance.checkIn;
        }
        return item.attendance.status === status;
      });
    }

    // Calculate stats
    const stats = {
      total: employees.length,
      present: result.filter(r => r.attendance.status === 'present').length,
      absent: result.filter(r => r.attendance.status === 'absent').length,
      leave: result.filter(r => r.attendance.status === 'leave').length,
      late: result.filter(r => r.attendance.status === 'late').length,
      notCheckedIn: result.filter(r => !r.attendance.checkIn).length
    };

    res.status(200).json({
      success: true,
      data: {
        records: filteredResult,
        stats,
        date: targetDate
      }
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
