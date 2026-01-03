const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const scheduler = require('../utils/scheduler');
const { auth, isAdmin } = require('../middleware/auth');

/**
 * Test Email Notifications
 * These routes are for testing email functionality
 * Should be removed or protected in production
 */

// Test birthday email
router.post('/test/birthday', auth, isAdmin, async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const Employee = require('../models/Employee');
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await emailService.sendBirthdayWishes(employee);
    
    res.status(200).json({
      success: true,
      message: `Birthday email sent to ${employee.email}`
    });
  } catch (error) {
    console.error('Test birthday email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Test anniversary email
router.post('/test/anniversary', auth, isAdmin, async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const Employee = require('../models/Employee');
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate years
    const joinDate = new Date(employee.joinDate);
    const today = new Date();
    const yearsCompleted = today.getFullYear() - joinDate.getFullYear();

    await emailService.sendWorkAnniversary(employee, yearsCompleted);
    
    res.status(200).json({
      success: true,
      message: `Anniversary email sent to ${employee.email} (${yearsCompleted} years)`
    });
  } catch (error) {
    console.error('Test anniversary email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Test missed checkout email
router.post('/test/missed-checkout', auth, isAdmin, async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const Employee = require('../models/Employee');
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await emailService.sendMissedCheckoutReminder(employee);
    
    res.status(200).json({
      success: true,
      message: `Missed checkout email sent to ${employee.email}`
    });
  } catch (error) {
    console.error('Test missed checkout email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Run scheduled task manually
router.post('/test/run-scheduler', auth, isAdmin, async (req, res) => {
  try {
    const { task } = req.body;
    
    if (!['birthday', 'anniversary', 'checkout'].includes(task)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task. Must be: birthday, anniversary, or checkout'
      });
    }

    await scheduler.runManual(task);
    
    res.status(200).json({
      success: true,
      message: `${task} task executed successfully`
    });
  } catch (error) {
    console.error('Run scheduler error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run scheduled task',
      error: error.message
    });
  }
});

// Get scheduler status
router.get('/scheduler/status', auth, isAdmin, (req, res) => {
  try {
    const status = scheduler.getStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get scheduler status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler status',
      error: error.message
    });
  }
});

module.exports = router;
