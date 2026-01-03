const mailSender = require('../utils/mailSender');
const Employee = require('../models/Employee');
const User = require('../models/User');

class EmailService {
  /**
   * Send missed checkout reminder to employee
   */
  async sendMissedCheckoutReminder(employee) {
    try {
      const template = require('../mail/templates/missedCheckoutTemplate');
      const htmlBody = template(employee.firstName, employee.lastName);
      
      await mailSender(
        employee.email,
        '⏰ Reminder: You forgot to check out today',
        htmlBody
      );
      
      console.log(`✅ Missed checkout reminder sent to ${employee.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending missed checkout reminder:', error);
      return false;
    }
  }

  /**
   * Send leave request notification to HR
   */
  async sendLeaveRequestToHR(leave, employee) {
    try {
      // Get all HR users
      const hrUsers = await User.find({ role: 'hr' }).select('email firstName');
      
      if (hrUsers.length === 0) {
        console.log('⚠️ No HR users found to send leave request notification');
        return false;
      }

      const template = require('../mail/templates/leaveRequestTemplate');
      const htmlBody = template(leave, employee);
      
      // Send to all HR users
      const emailPromises = hrUsers.map(hr => 
        mailSender(
          hr.email,
          `📋 New Leave Request from ${employee.firstName} ${employee.lastName}`,
          htmlBody
        )
      );
      
      await Promise.all(emailPromises);
      
      console.log(`✅ Leave request notification sent to ${hrUsers.length} HR user(s)`);
      return true;
    } catch (error) {
      console.error('❌ Error sending leave request to HR:', error);
      return false;
    }
  }

  /**
   * Send leave decision notification to employee
   */
  async sendLeaveDecision(leave, employee, status, approvedBy) {
    try {
      const template = require('../mail/templates/leaveDecisionTemplate');
      const htmlBody = template(leave, employee, status, approvedBy);
      
      const subject = status === 'approved' 
        ? '✅ Your Leave Request has been Approved'
        : '❌ Your Leave Request has been Rejected';
      
      await mailSender(
        employee.email,
        subject,
        htmlBody
      );
      
      console.log(`✅ Leave ${status} notification sent to ${employee.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending leave decision:', error);
      return false;
    }
  }

  /**
   * Send birthday wishes to employee
   */
  async sendBirthdayWishes(employee) {
    try {
      const template = require('../mail/templates/birthdayTemplate');
      const htmlBody = template(employee.firstName, employee.lastName);
      
      await mailSender(
        employee.email,
        `🎂 Happy Birthday ${employee.firstName}! 🎉`,
        htmlBody
      );
      
      console.log(`✅ Birthday wishes sent to ${employee.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending birthday wishes:', error);
      return false;
    }
  }

  /**
   * Send work anniversary wishes to employee
   */
  async sendWorkAnniversary(employee, yearsCompleted) {
    try {
      const template = require('../mail/templates/anniversaryTemplate');
      const htmlBody = template(employee.firstName, employee.lastName, yearsCompleted);
      
      await mailSender(
        employee.email,
        `🎊 Happy Work Anniversary ${employee.firstName}! ${yearsCompleted} Year${yearsCompleted > 1 ? 's' : ''} with Dayflow`,
        htmlBody
      );
      
      console.log(`✅ Work anniversary wishes sent to ${employee.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending work anniversary:', error);
      return false;
    }
  }

  /**
   * Check for birthdays today and send wishes
   */
  async checkAndSendBirthdayWishes() {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
      const currentDay = today.getDate();
      
      // Find employees with birthday today
      const employees = await Employee.find({
        status: 'active',
        dateOfBirth: { $exists: true, $ne: null }
      });
      
      const birthdayEmployees = employees.filter(emp => {
        const birthDate = new Date(emp.dateOfBirth);
        return birthDate.getMonth() + 1 === currentMonth && 
               birthDate.getDate() === currentDay;
      });
      
      if (birthdayEmployees.length === 0) {
        console.log('ℹ️ No birthdays today');
        return;
      }
      
      console.log(`🎂 Found ${birthdayEmployees.length} birthday(s) today!`);
      
      // Send birthday wishes to all
      const promises = birthdayEmployees.map(emp => this.sendBirthdayWishes(emp));
      await Promise.all(promises);
      
      console.log(`✅ Birthday wishes sent to ${birthdayEmployees.length} employee(s)`);
    } catch (error) {
      console.error('❌ Error in birthday check:', error);
    }
  }

  /**
   * Check for work anniversaries today and send wishes
   */
  async checkAndSendAnniversaryWishes() {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      const currentYear = today.getFullYear();
      
      // Find employees with joining date anniversary today
      const employees = await Employee.find({
        status: 'active',
        joinDate: { $exists: true, $ne: null }
      });
      
      const anniversaryEmployees = employees
        .map(emp => {
          const joinDate = new Date(emp.joinDate);
          const yearsCompleted = currentYear - joinDate.getFullYear();
          
          // Check if anniversary is today and at least 1 year completed
          if (joinDate.getMonth() + 1 === currentMonth && 
              joinDate.getDate() === currentDay && 
              yearsCompleted >= 1) {
            return { employee: emp, yearsCompleted };
          }
          return null;
        })
        .filter(Boolean);
      
      if (anniversaryEmployees.length === 0) {
        console.log('ℹ️ No work anniversaries today');
        return;
      }
      
      console.log(`🎊 Found ${anniversaryEmployees.length} work anniversary/anniversaries today!`);
      
      // Send anniversary wishes to all
      const promises = anniversaryEmployees.map(({ employee, yearsCompleted }) => 
        this.sendWorkAnniversary(employee, yearsCompleted)
      );
      await Promise.all(promises);
      
      console.log(`✅ Anniversary wishes sent to ${anniversaryEmployees.length} employee(s)`);
    } catch (error) {
      console.error('❌ Error in anniversary check:', error);
    }
  }

  /**
   * Check for missed checkouts and send reminders
   */
  async checkAndSendMissedCheckoutReminders() {
    try {
      const Attendance = require('../models/Attendance');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find attendance records with check-in but no check-out for today
      const missedCheckouts = await Attendance.find({
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        },
        'checkIn.time': { $exists: true },
        'checkOut.time': { $exists: false }
      }).populate('employee');
      
      if (missedCheckouts.length === 0) {
        console.log('ℹ️ No missed checkouts found');
        return;
      }
      
      console.log(`⏰ Found ${missedCheckouts.length} missed checkout(s)`);
      
      // Send reminders
      const promises = missedCheckouts.map(attendance => 
        this.sendMissedCheckoutReminder(attendance.employee)
      );
      await Promise.all(promises);
      
      console.log(`✅ Missed checkout reminders sent to ${missedCheckouts.length} employee(s)`);
    } catch (error) {
      console.error('❌ Error in missed checkout check:', error);
    }
  }
}

module.exports = new EmailService();
