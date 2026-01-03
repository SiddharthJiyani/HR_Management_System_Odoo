const cron = require('node-cron');
const emailService = require('../services/emailService');

/**
 * Scheduled Tasks for HR Management System
 * 
 * 1. Daily Birthday Wishes - Runs at 8:00 AM every day
 * 2. Daily Work Anniversary Wishes - Runs at 8:30 AM every day
 * 3. Missed Checkout Reminders - Runs at 8:00 PM every day
 */

class Scheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Initialize all scheduled tasks
   */
  init() {
    console.log('⏰ Initializing scheduled tasks...');

    // Birthday wishes - Every day at 8:00 AM
    const birthdayJob = cron.schedule('0 8 * * *', async () => {
      console.log('🎂 Running daily birthday check...');
      try {
        await emailService.checkAndSendBirthdayWishes();
      } catch (error) {
        console.error('❌ Birthday check failed:', error.message);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // Indian Standard Time
    });
    this.jobs.push({ name: 'Birthday Wishes', job: birthdayJob });
    console.log('✅ Birthday wishes scheduled: Every day at 8:00 AM IST');

    // Work anniversary wishes - Every day at 8:30 AM
    const anniversaryJob = cron.schedule('30 8 * * *', async () => {
      console.log('🏆 Running daily anniversary check...');
      try {
        await emailService.checkAndSendAnniversaryWishes();
      } catch (error) {
        console.error('❌ Anniversary check failed:', error.message);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
    this.jobs.push({ name: 'Work Anniversary', job: anniversaryJob });
    console.log('✅ Work anniversary wishes scheduled: Every day at 8:30 AM IST');

    // Missed checkout reminders - Every day at 8:00 PM
    const missedCheckoutJob = cron.schedule('0 20 * * *', async () => {
      console.log('⏰ Running missed checkout check...');
      try {
        await emailService.checkAndSendMissedCheckoutReminders();
      } catch (error) {
        console.error('❌ Missed checkout check failed:', error.message);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
    this.jobs.push({ name: 'Missed Checkout', job: missedCheckoutJob });
    console.log('✅ Missed checkout reminders scheduled: Every day at 8:00 PM IST');

    console.log(`⏰ ${this.jobs.length} scheduled tasks initialized successfully!`);
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll() {
    console.log('🛑 Stopping all scheduled tasks...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`✅ Stopped: ${name}`);
    });
    this.jobs = [];
  }

  /**
   * Get status of all scheduled tasks
   */
  getStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: job.running || false
    }));
  }

  /**
   * Run a task manually (for testing)
   */
  async runManual(taskName) {
    console.log(`🔧 Running ${taskName} manually...`);
    
    switch(taskName) {
      case 'birthday':
        await emailService.checkAndSendBirthdayWishes();
        break;
      case 'anniversary':
        await emailService.checkAndSendAnniversaryWishes();
        break;
      case 'checkout':
        await emailService.checkAndSendMissedCheckoutReminders();
        break;
      default:
        throw new Error(`Unknown task: ${taskName}`);
    }
    
    console.log(`✅ ${taskName} task completed`);
  }
}

// Export singleton instance
module.exports = new Scheduler();
