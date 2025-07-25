
// src/services/email.service.ts
import nodemailer from 'nodemailer';
import { EmailNotificationPayload } from '../types/notification.types';

export class EmailService {
    private static transporter: nodemailer.Transporter;

    static initialize() {
        // Initialize email transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            pool: true, // Use connection pooling
            maxConnections: 5,
            maxMessages: 10,
        });

        // Verify connection configuration
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('Email service configuration error:', error);
            } else {
                console.log('Email service ready for messages');
            }
        });
    }

    static async sendEmail(payload: EmailNotificationPayload): Promise<boolean> {
        try {
            if (!this.transporter) {
                this.initialize();
            }

            const mailOptions = {
                from: `"${process.env.APP_NAME || 'GAD Builder'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
                priority: (payload.priority === 'high'
                    ? 'high'
                    : payload.priority === 'low'
                        ? 'low'
                        : 'normal') as 'high' | 'normal' | 'low',
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return true;

        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    static async sendBulkEmails(payloads: EmailNotificationPayload[]): Promise<boolean[]> {
        const results = await Promise.allSettled(
            payloads.map(payload => this.sendEmail(payload))
        );

        return results.map(result =>
            result.status === 'fulfilled' ? result.value : false
        );
    }
}

