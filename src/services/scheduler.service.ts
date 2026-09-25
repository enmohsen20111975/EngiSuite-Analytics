/**
 * Scheduler Service - Background Jobs
 */

import cron from 'node-cron';
import { prisma } from './database.service.js';

// Store for active scheduled jobs
const scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

/**
 * Check for expiring subscriptions and send renewal reminders
 */
async function checkExpiringSubscriptions(): Promise<void> {
  console.log('🔍 Checking for expiring subscriptions...');
  
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

    // Find users with subscriptions expiring in 3 days
    const expiringUsers = await prisma.user.findMany({
      where: {
        subscriptionEndDate: {
          gte: threeDaysFromNow,
          lt: fourDaysFromNow,
        },
        subscriptionStatus: 'active',
        tier: { in: ['starter', 'pro', 'enterprise'] },
      },
    });

    for (const user of expiringUsers) {
      // TODO: Send renewal reminder email
      console.log(`📧 Would send renewal reminder to ${user.email}`);
    }

    // Handle expired subscriptions
    const expiredUsers = await prisma.user.updateMany({
      where: {
        subscriptionEndDate: { lt: now },
        subscriptionStatus: 'active',
      },
      data: {
        subscriptionStatus: 'expired',
        tier: 'free',
      },
    });

    if (expiredUsers.count > 0) {
      console.log(`⏰ ${expiredUsers.count} subscriptions expired and downgraded to free`);
    }
  } catch (error) {
    console.error('❌ Error checking subscriptions:', error);
  }
}

/**
 * Perform daily backup of SQLite databases
 */
async function performDailyBackup(): Promise<void> {
  console.log('💾 Starting daily backup...');
  
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const backupDir = path.join(process.cwd(), 'backups');
    const dbPath = path.join(process.cwd(), 'prisma', 'data', 'engisuite.db');
    
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create backup with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(backupDir, `engisuite-${timestamp}.db`);
    
    await fs.copyFile(dbPath, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);
    
    // Clean up old backups (keep last 7)
    const files = await fs.readdir(backupDir);
    const dbBackups = files
      .filter(f => f.startsWith('engisuite-') && f.endsWith('.db'))
      .sort()
      .reverse();
    
    for (const oldFile of dbBackups.slice(7)) {
      await fs.unlink(path.join(backupDir, oldFile));
      console.log(`🗑️ Removed old backup: ${oldFile}`);
    }
  } catch (error) {
    console.error('❌ Backup failed:', error);
  }
}

/**
 * Start all scheduled jobs
 */
export function startSchedulers(): void {
  // Subscription check - daily at 9 AM
  const subscriptionJob = cron.schedule('0 9 * * *', checkExpiringSubscriptions, {
    timezone: 'UTC',
  });
  scheduledJobs.set('subscription_check', subscriptionJob);
  console.log('📅 Scheduled: Subscription expiry check (daily at 9 AM)');

  // Daily backup - at 2 AM
  const backupJob = cron.schedule('0 2 * * *', performDailyBackup, {
    timezone: 'UTC',
  });
  scheduledJobs.set('daily_backup', backupJob);
  console.log('📅 Scheduled: Daily backup (at 2 AM)');
}

/**
 * Stop all scheduled jobs
 */
export function stopSchedulers(): void {
  for (const [name, job] of scheduledJobs) {
    job.stop();
    console.log(`⏹️ Stopped scheduler: ${name}`);
  }
  scheduledJobs.clear();
}
