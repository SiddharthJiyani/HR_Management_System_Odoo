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

    // Employees already have currentAttendanceStatus field updated by check-in/out
    // Just return them as-is, the field is already set correctly
    const employeesWithStatus = employees.map(emp => ({
      ...emp.toObject(),
      // Use the stored field - it's updated by check-in/out controllers
      currentAttendanceStatus: emp.currentAttendanceStatus || 'not-checked-in'
    }));

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

    let employeeData = employee.toObject();

    // Role-based data filtering
    if (requestingUser.role === 'hr') {
      // HR can see overall salary but not detailed breakdown
      employeeData.salary = {
        monthlyWage: employee.salary.monthlyWage,
        yearlyWage: employee.salary.yearlyWage,
        currency: employee.salary.currency,
        grossSalary: employee.salary.grossSalary,
        netSalary: employee.salary.netSalary,
        // Hide detailed components and deductions
        components: undefined,
        deductions: undefined
      };
      // HR cannot see bank details
      delete employeeData.bankDetails;
    } else if (requestingUser.role === 'employee') {
      // Employee can only see their own full profile
      if (requestingUser.id !== employee.user.toString()) {
        delete employeeData.salary;
        delete employeeData.bankDetails;
      }
    }
    // Admin can see everything

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

    // Role-based update permissions
    if (requestingUser.role === 'hr') {
      // HR can view but NOT edit employee profiles
      return res.status(403).json({
        success: false,
        message: 'HR can view employee profiles but cannot edit them. Only Admin can edit.'
      });
    } else if (requestingUser.role === 'employee') {
      // Employees can only update their own profile
      if (requestingUser.id !== employee.user.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own profile'
        });
      }

      // Employees can update these fields only (NOT salary)
      const allowedFields = [
        'phone', 'address', 'emergencyContact', 'profilePhoto',
        'about', 'skills', 'certifications', 'interests',
        'nationality', 'personalEmail', 'maritalStatus', 'residingAddress',
        'bankDetails' // Employee can update bank details
      ];
      
      const filteredUpdates = {};
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });

      Object.assign(employee, filteredUpdates);
    } else if (requestingUser.role === 'admin') {
      // Admin can update everything including salary
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

    console.log('Updating profile for user:', userId);
    console.log('Update data received:', updates);

    const employee = await Employee.findOne({ user: userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Employees can update these fields (NOT salary, NOT role/department changes)
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'address', 'emergencyContact', 'profilePhoto',
      'about', 'skills', 'certifications', 'interests',
      'nationality', 'personalEmail', 'maritalStatus', 'residingAddress',
      'dateOfBirth', 'gender', 'bankDetails' // Employee can update their personal & bank details
    ];
    
    // Build update object with only allowed fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    console.log('Filtered update data:', updateData);

    // Use findByIdAndUpdate to avoid full validation
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    console.log('Profile updated successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Update my profile error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
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

// Get employee salary details (Admin only for edit, Employee can view own)
exports.getEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    const employee = await Employee.findById(id).select('salary workingSchedule firstName lastName employeeId');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check permissions
    if (requestingUser.role === 'employee' && requestingUser.id !== employee.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own salary information'
      });
    }

    if (requestingUser.role === 'hr') {
      // HR can only see basic salary info, not detailed breakdown
      return res.status(200).json({
        success: true,
        data: {
          monthlyWage: employee.salary.monthlyWage,
          yearlyWage: employee.salary.yearlyWage,
          grossSalary: employee.salary.grossSalary,
          netSalary: employee.salary.netSalary,
          currency: employee.salary.currency
        },
        message: 'HR can only view basic salary information'
      });
    }

    // Admin and Employee (owner) can see full breakdown
    res.status(200).json({
      success: true,
      data: {
        salary: employee.salary,
        workingSchedule: employee.workingSchedule,
        employeeInfo: {
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId
        }
      }
    });
  } catch (error) {
    console.error('Get employee salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary information'
    });
  }
};

// Update employee salary (Admin only)
exports.updateEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;
    const { salary, workingSchedule } = req.body;

    // Only Admin can update salary
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin can update salary information'
      });
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update salary and working schedule
    if (salary) {
      Object.assign(employee.salary, salary);
    }

    if (workingSchedule) {
      Object.assign(employee.workingSchedule, workingSchedule);
    }

    await employee.save(); // Pre-save hook will auto-calculate components

    res.status(200).json({
      success: true,
      message: 'Salary information updated successfully',
      data: {
        salary: employee.salary,
        workingSchedule: employee.workingSchedule
      }
    });
  } catch (error) {
    console.error('Update employee salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salary information'
    });
  }
};

// Get my salary details (Employee)
exports.getMySalary = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await Employee.findOne({ user: userId })
      .select('salary workingSchedule firstName lastName employeeId');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        salary: employee.salary,
        workingSchedule: employee.workingSchedule,
        employeeInfo: {
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId
        }
      }
    });
  } catch (error) {
    console.error('Get my salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary information'
    });
  }
};
