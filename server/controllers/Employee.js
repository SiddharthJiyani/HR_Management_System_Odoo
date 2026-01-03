const Employee = require("../models/Employee");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

// Get all employees (HR/Admin only)
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, status, search, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .select('-salary -bankDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(query)
    ]);

    // Get today's attendance status for each employee
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employeesWithStatus = await Promise.all(
      employees.map(async (emp) => {
        const attendance = await Attendance.findOne({
          employee: emp._id,
          date: today
        });
        
        return {
          ...emp.toObject(),
          currentAttendanceStatus: attendance?.status || 'not-checked-in'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: employeesWithStatus,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees'
    });
  }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    const employee = await Employee.findById(id)
      .populate('reportingManager', 'firstName lastName email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // If not HR/Admin, hide sensitive fields
    let employeeData = employee.toObject();
    if (requestingUser.role === 'employee' && requestingUser.id !== employee.user.toString()) {
      delete employeeData.salary;
      delete employeeData.bankDetails;
    }

    // Get attendance summary for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendanceSummary = await Attendance.getEmployeeSummary(
      employee._id,
      startOfMonth,
      endOfMonth
    );

    res.status(200).json({
      success: true,
      data: {
        ...employeeData,
        attendanceSummary
      }
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee'
    });
  }
};

// Get current logged-in employee's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await Employee.findOne({ user: userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Get attendance summary for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendanceSummary = await Attendance.getEmployeeSummary(
      employee._id,
      startOfMonth,
      endOfMonth
    );

    res.status(200).json({
      success: true,
      data: {
        ...employee.toObject(),
        attendanceSummary
      }
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Create new employee (HR/Admin only)
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      role,
      employmentType,
      joinDate,
      reportingManager,
      salary
    } = req.body;

    // Check if employee with email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Generate employee ID
    const currentYear = new Date().getFullYear();
    const employeeCount = await Employee.countDocuments();
    const employeeId = `EMP${currentYear}${String(employeeCount + 1).padStart(4, '0')}`;

    // Create User account for the employee
    const bcrypt = require('bcrypt');
    const tempPassword = `${firstName.toLowerCase()}${employeeId}@123`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      employeeId,
      email,
      password: hashedPassword,
      role: role || 'employee',
      firstName,
      lastName
    });

    // Create employee profile
    const employee = await Employee.create({
      user: newUser._id,
      firstName,
      lastName,
      email,
      phone,
      employeeId,
      department,
      designation,
      role: role || 'employee',
      employmentType: employmentType || 'Full-time',
      joinDate: joinDate || new Date(),
      reportingManager,
      salary: salary || { basic: 0, allowances: 0, deductions: 0 }
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
      tempPassword // Send this to HR so they can share with the employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee'
    });
  }
};

// Update employee (HR/Admin can update all, Employee can update limited fields)
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;
    const updates = req.body;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // If employee is updating their own profile, restrict fields
    if (requestingUser.role === 'employee') {
      // Employees can only update these fields
      const allowedFields = ['phone', 'address', 'emergencyContact', 'profilePhoto'];
      const filteredUpdates = {};
      
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });

      Object.assign(employee, filteredUpdates);
    } else {
      // HR/Admin can update all fields
      Object.assign(employee, updates);
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee'
    });
  }
};

// Update my profile (for logged-in employee)
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const employee = await Employee.findOne({ user: userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Employees can only update these fields
    const allowedFields = ['phone', 'address', 'emergencyContact', 'profilePhoto'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        employee[field] = updates[field];
      }
    });

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Delete/Deactivate employee (HR/Admin only)
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Soft delete - just change status
    employee.status = 'terminated';
    await employee.save();

    // Also deactivate the user account
    await User.findByIdAndUpdate(employee.user, { status: 'inactive' });

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate employee'
    });
  }
};

// Get employee statistics (HR/Admin only)
exports.getEmployeeStats = async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      departmentStats,
      todayAttendance
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Employee.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      (async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Attendance.aggregate([
          { $match: { date: today } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
      })()
    ]);

    const attendanceStats = {
      present: 0,
      absent: 0,
      leave: 0,
      notCheckedIn: activeEmployees
    };

    todayAttendance.forEach(item => {
      if (item._id === 'present') {
        attendanceStats.present = item.count;
        attendanceStats.notCheckedIn -= item.count;
      } else if (item._id === 'absent') {
        attendanceStats.absent = item.count;
        attendanceStats.notCheckedIn -= item.count;
      } else if (item._id === 'leave') {
        attendanceStats.leave = item.count;
        attendanceStats.notCheckedIn -= item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalEmployees,
        active: activeEmployees,
        departments: departmentStats,
        todayAttendance: attendanceStats
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee statistics'
    });
  }
};
