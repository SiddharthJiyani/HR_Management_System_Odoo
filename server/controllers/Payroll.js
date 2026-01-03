const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");

// Get my payroll (Employee - read only)
exports.getMyPayroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, page = 1, limit = 12 } = req.query;

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
    
    if (year) {
      query.year = parseInt(year);
    }

    const skip = (page - 1) * limit;

    const [payrolls, total] = await Promise.all([
      Payroll.find(query)
        .sort({ year: -1, month: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payroll.countDocuments(query)
    ]);

    // Calculate YTD (Year to Date) totals
    const currentYear = new Date().getFullYear();
    const ytdPayrolls = await Payroll.find({
      employee: employee._id,
      year: currentYear,
      paymentStatus: 'paid'
    });

    const ytdTotals = ytdPayrolls.reduce((acc, p) => ({
      grossEarnings: acc.grossEarnings + p.grossEarnings,
      totalDeductions: acc.totalDeductions + p.totalDeductions,
      netSalary: acc.netSalary + p.netSalary
    }), { grossEarnings: 0, totalDeductions: 0, netSalary: 0 });

    res.status(200).json({
      success: true,
      data: {
        payrolls,
        ytdTotals,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll'
    });
  }
};

// Get specific payslip details (Employee)
exports.getPayslip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get employee
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const payroll = await Payroll.findOne({
      _id: id,
      employee: employee._id
    }).populate('employee', 'firstName lastName employeeId department designation');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Get payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payslip'
    });
  }
};

// Get all payrolls (HR/Admin)
exports.getAllPayrolls = async (req, res) => {
  try {
    const { month, year, department, status, page = 1, limit = 50 } = req.query;

    // Build employee filter
    const employeeQuery = { status: 'active' };
    if (department) {
      employeeQuery.department = department;
    }
    const employees = await Employee.find(employeeQuery).select('_id');
    const employeeIds = employees.map(e => e._id);

    // Build payroll query
    const query = { employee: { $in: employeeIds } };
    
    if (month) {
      query.month = parseInt(month);
    }
    if (year) {
      query.year = parseInt(year);
    }
    if (status) {
      query.paymentStatus = status;
    }

    const skip = (page - 1) * limit;

    const [payrolls, total, stats] = await Promise.all([
      Payroll.find(query)
        .populate('employee', 'firstName lastName employeeId department designation profilePhoto')
        .sort({ year: -1, month: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payroll.countDocuments(query),
      Payroll.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$netSalary' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        payrolls,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payrolls'
    });
  }
};

// Get employee payroll (HR/Admin)
exports.getEmployeePayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const query = { employee: employeeId };
    if (year) {
      query.year = parseInt(year);
    }

    const payrolls = await Payroll.find(query).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      data: {
        employee: {
          _id: employee._id,
          name: employee.name,
          employeeId: employee.employeeId,
          department: employee.department,
          salary: employee.salary
        },
        payrolls
      }
    });
  } catch (error) {
    console.error('Get employee payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee payroll'
    });
  }
};

// Generate payroll for a month (HR/Admin)
exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const generatedBy = req.user.id;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    const result = await Payroll.generateMonthlyPayroll(month, year, generatedBy);

    res.status(201).json({
      success: true,
      message: `Payroll generated for ${result.length} employees`,
      data: {
        count: result.length,
        month,
        year
      }
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payroll'
    });
  }
};

// Update payroll (HR/Admin)
exports.updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const payroll = await Payroll.findById(id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    if (payroll.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a paid payroll record'
      });
    }

    // Update allowed fields
    const allowedFields = ['earnings', 'deductions', 'workingDays', 'paymentStatus', 'paymentDate', 'remarks'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        payroll[field] = updates[field];
      }
    });

    await payroll.save();

    res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      data: payroll
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payroll'
    });
  }
};

// Process payroll payment (HR/Admin)
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const payroll = await Payroll.findById(id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    if (payroll.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed'
      });
    }

    payroll.paymentStatus = 'paid';
    payroll.paymentDate = new Date();
    payroll.paymentMethod = paymentMethod || 'bank-transfer';
    payroll.transactionId = transactionId || '';

    await payroll.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: payroll
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Update employee salary structure (HR/Admin)
exports.updateSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { basic, allowances, deductions, currency } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.salary = {
      basic: basic !== undefined ? basic : employee.salary.basic,
      allowances: allowances !== undefined ? allowances : employee.salary.allowances,
      deductions: deductions !== undefined ? deductions : employee.salary.deductions,
      currency: currency || employee.salary.currency
    };

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Salary structure updated successfully',
      data: {
        employeeId: employee.employeeId,
        name: employee.name,
        salary: employee.salary
      }
    });
  } catch (error) {
    console.error('Update salary structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salary structure'
    });
  }
};

// Get payroll summary/statistics (HR/Admin)
exports.getPayrollStats = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const stats = await Payroll.aggregate([
      { $match: { year: targetYear } },
      {
        $group: {
          _id: { month: '$month', status: '$paymentStatus' },
          totalGross: { $sum: '$grossEarnings' },
          totalDeductions: { $sum: '$totalDeductions' },
          totalNet: { $sum: '$netSalary' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          statuses: {
            $push: {
              status: '$_id.status',
              totalGross: '$totalGross',
              totalDeductions: '$totalDeductions',
              totalNet: '$totalNet',
              count: '$count'
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const yearlyTotals = await Payroll.aggregate([
      { $match: { year: targetYear, paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$grossEarnings' },
          totalDeductions: { $sum: '$totalDeductions' },
          totalNet: { $sum: '$netSalary' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthly: stats,
        yearly: yearlyTotals[0] || { totalGross: 0, totalDeductions: 0, totalNet: 0, count: 0 },
        year: targetYear
      }
    });
  } catch (error) {
    console.error('Get payroll stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll statistics'
    });
  }
};
