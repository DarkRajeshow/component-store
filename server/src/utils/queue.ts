// src/utils/queue.ts
import Bull from 'bull';
import { NotificationJob } from '../types/queue.types';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

// Initialize Redis connection for Bull queue
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
};

// Create notification queue
export const notificationQueue = new Bull<NotificationJob>('notification processing', {
    redis: redisConfig,
    defaultJobOptions: {
        removeOnComplete: 50, // Keep last 50 completed jobs
        removeOnFail: 100,    // Keep last 100 failed jobs
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
    }
});

// Process notification jobs
notificationQueue.process('process-notification', async (job) => {
    const { type, inAppPayload, emailPayload } = job.data;

    console.log(`Processing notification job: ${job.id}, type: ${type}`);

    try {
        // Process in-app notification
        if ((type === 'in-app' || type === 'both') && inAppPayload) {
            await NotificationService.createInAppNotification(inAppPayload);
            console.log(`In-app notification sent to: ${inAppPayload.recipient}`);
        }

        // Process email notification
        if ((type === 'email' || type === 'both') && emailPayload) {
            await EmailService.sendEmail(emailPayload);
            console.log(`Email notification sent to: ${emailPayload.to}`);
        }

        // Update job progress
        job.progress(100);

    } catch (error) {
        console.error(`Error processing notification job ${job.id}:`, error);
        throw error; // This will mark the job as failed and trigger retry if configured
    }
});

// Queue event handlers
notificationQueue.on('completed', (job) => {
    console.log(`Notification job ${job.id} completed successfully`);
});

notificationQueue.on('failed', (job, err) => {
    console.error(`Notification job ${job.id} failed:`, err.message);
});

notificationQueue.on('stalled', (job) => {
    console.warn(`Notification job ${job.id} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Gracefully closing notification queue...');
    await notificationQueue.close();
});



// src/package.json additions (add these to your existing package.json)
/*
Add these dependencies to your backend package.json:

"bull": "^4.12.9",
"@types/bull": "^4.10.0",
"nodemailer": "^6.9.8",
"@types/nodemailer": "^6.4.14",
"socket.io": "^4.7.4",
"redis": "^4.6.12"
*/