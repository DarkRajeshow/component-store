// src/services/notification.service.ts
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Admin } from '../models/admin.model';
import { NotificationPayload, EmailNotificationPayload, SocketNotificationPayload, INotification } from '../types/notification.types';
import { getNotificationTemplate } from '../utils/notification-templates';
import { notificationQueue } from '../utils/queue';
import { getSocketInstance } from '../utils/socket';
import { Designation } from '../types/user.types';
import { EmailService } from './email.service';


export class NotificationService {
    // Create in-app notification
    static async createInAppNotification(payload: NotificationPayload): Promise<INotification | null> {
        try {
            const notification = new Notification(payload);
            
            console.log("notification");
            console.log(notification);
            
            await notification.save();

            // Emit real-time notification via Socket.IO
            const io = getSocketInstance();
            if (io) {
                io.to(`user_${payload.recipient}`).emit('new-notification', {
                    notification: notification.toObject(),
                    unreadCount: await this.getUnreadCount(payload.recipient)
                });
            }

            return notification;
        } catch (error) {
            console.error('Error creating in-app notification:', error);
            return null;
        }
    }

    // Send notification (both in-app and email)
    static async sendNotification(
        type: 'registration' | 'dh_approval' | 'admin_approval' | 'rejection',
        recipientId: string,
        recipientType: 'user' | 'admin',
        data: any,
        sendEmail: boolean = true
    ) {
        try {
            // Get recipient details
            let recipient;
            console.log("[NotificationService] sendNotification called for recipientId:", recipientId, "recipientType:", recipientType);
            if (recipientType === 'admin') {
                recipient = await Admin.findById(recipientId);
            } else {
                recipient = await User.findById(recipientId);
            }
            console.log("[NotificationService] recipient:", recipient);
            
            if (!recipient) {
                console.error('Recipient not found:', recipientId);
                return;
            }

            const templates = getNotificationTemplate(type, data);
            if (!templates) {
                console.error('No template found for notification type:', type);
                return;
            }

            // Determine which template to use based on recipient type and context
            let template;
            if (type === 'registration' && recipientType === 'user') {
                template = templates.user;
            } else if (type === 'registration' && recipientType === 'admin') {
                template = 'dh' in templates ? templates.dh : undefined; // Department head is also a user but acts as approver
            } else if (type === 'dh_approval' && recipientType === 'admin') {
                template = 'admin' in templates ? templates.admin : undefined;
            } else if (type === 'dh_approval' && recipientType === 'user') {
                template = templates.user;
            } else if (type === 'admin_approval' && recipientType === 'user') {
                template = templates.user;
            } else if (type === 'rejection' && recipientType === 'user') {
                template = templates.user;
            }

            if (!template) {
                console.error('No specific template found for:', type, recipientType);
                return;
            }

            const actionUrl = 'actionUrl' in template ? template.actionUrl as string : undefined;
            // Create in-app notification payload
            const inAppPayload: NotificationPayload = {
                recipient: recipientId,
                recipientType,
                type,
                title: template.title,
                message: template.message,
                data,
                priority: template.priority,
                actionRequired: template.actionRequired,
                actionUrl
            };

            // Always try to save in-app notification immediately
            try {
                const savedNotification = await this.createInAppNotification(inAppPayload);
                if (!savedNotification) {
                    console.error('Failed to save in-app notification for', recipientId);
                } else {
                    console.log('In-app notification saved:', savedNotification._id);
                }
            } catch (err) {
                console.error('Error saving in-app notification:', err);
            }

            // Create email payload if email is requested
            let emailPayload: EmailNotificationPayload | undefined;
            if (sendEmail) {
                try {
                    emailPayload = {
                        to: recipient.email,
                        subject: template.title,
                        html: await this.generateEmailHTML(template.title, template.message, data, actionUrl),
                        priority: template.priority
                    };
                    console.log('Email payload prepared for', recipient.email);
                } catch (err) {
                    console.error('Error preparing email payload:', err);
                }
            }

            // Add to queue for background processing
            try {
                await notificationQueue.add('process-notification', {
                    type: sendEmail ? 'both' : 'in-app',
                    inAppPayload,
                    emailPayload
                }, {
                    priority: template.priority === 'high' ? 10 : template.priority === 'medium' ? 5 : 1,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                });
                console.log('Notification job added to queue for', recipientId);
            } catch (queueError) {
                console.error('Error adding notification to queue:', queueError);
                // Fallback: try to send email directly if queue fails
                if (sendEmail && emailPayload) {
                    try {
                        // You should have a mailer utility, e.g. sendMail(emailPayload)
                        // Uncomment and implement the following line as per your mailer setup:
                        await EmailService.sendEmail(emailPayload);
                        console.log('Fallback: Email would be sent directly to', emailPayload.to);
                    } catch (mailError) {
                        console.error('Fallback email send failed:', mailError);
                    }
                }
            }

        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    // Get user notifications with pagination
    static async getUserNotifications(
        userId: string,
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false
    ) {
        try {
            const skip = (page - 1) * limit;
            const filter: any = {
                recipient: userId,
                isDeleted: false
            };

            if (unreadOnly) {
                filter.isRead = false;
            }

            const notifications = await Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Notification.countDocuments(filter);
            const unreadCount = await this.getUnreadCount(userId);

            return {
                notifications,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                },
                unreadCount
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return null;
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId: string, userId: string) {
        try {
            const result = await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                {
                    isRead: true,
                    readAt: new Date()
                },
                { new: true }
            );

            if (result) {
                // Emit updated unread count
                const io = getSocketInstance();
                if (io) {
                    const unreadCount = await this.getUnreadCount(userId);
                    io.to(`user_${userId}`).emit('notification-read', {
                        notificationId,
                        unreadCount
                    });
                }
            }

            return result;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return null;
        }
    }

    // Mark all notifications as read
    static async markAllAsRead(userId: string) {
        try {
            await Notification.updateMany(
                { recipient: userId, isRead: false },
                {
                    isRead: true,
                    readAt: new Date()
                }
            );

            // Emit updated unread count
            const io = getSocketInstance();
            if (io) {
                io.to(`user_${userId}`).emit('all-notifications-read', {
                    unreadCount: 0
                });
            }

            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    // Delete notification
    static async deleteNotification(notificationId: string, userId: string) {
        try {
            const result = await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { isDeleted: true }
            );
            return !!result;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }

    // Get unread count
    static async getUnreadCount(userId: string): Promise<number> {
        try {
            return await Notification.countDocuments({
                recipient: userId,
                isRead: false,
                isDeleted: false
            });
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    // Generate email HTML template; no db or socket operation
    private static async generateEmailHTML(
        title: string,
        message: string,
        data: any,
        actionUrl?: string
    ): Promise<string> {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const fullActionUrl = actionUrl ? `${baseUrl}${actionUrl}` : '';

        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${message}</p>
          ${data.remarks ? `<p><strong>Remarks:</strong> ${data.remarks}</p>` : ''}
          ${fullActionUrl ? `<a href="${fullActionUrl}" class="button">Take Action</a>` : ''}
        </div>
        <div class="footer">
          <p>This is an automated message from Components store Application.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
    }

    // Send notifications for user registration
    static async sendRegistrationNotifications(user: any) {
        // Send notification to user
        await this.sendNotification(
            'registration',
            user._id.toString(),
            'user',
            {
                userName: user.name,
                department: user.department,
                employeeId: user.employeeId
            },
            true
        );

        const isDepartmentHead = user.designation === Designation.DEPARTMENT_HEAD;
        
        if (!isDepartmentHead) {
            // Find and notify department head
            const departmentHead = await User.findOne({
                department: user.department,
                designation: 'Department Head',
                isApproved: true
            });
            
            if (departmentHead) {
                await this.sendNotification(
                    'registration',
                    departmentHead._id.toString(),
                    'user',
                    {
                        userName: user.name,
                        department: user.department,
                        employeeId: user.employeeId,
                        userEmail: user.email
                    },
                    true
                );
            }
            else {
                console.log("No department head found.");
            }
        }
        else {
            console.log("User is department head no, dh verification required...");
        }
    }


    // Send notifications for department head approval
    static async sendDHApprovalNotifications(user: any, approved: boolean, remarks?: string) {
        if (approved) {
            // Notify user
            await this.sendNotification(
                'dh_approval',
                user._id.toString(),
                'user',
                {
                    userName: user.name,
                    department: user.department
                },
                true
            );

            // Notify admin
            const admin = await Admin.findOne();
            if (admin) {
                await this.sendNotification(
                    'dh_approval',
                    admin._id.toString(),
                    'admin',
                    {
                        userName: user.name,
                        department: user.department,
                        employeeId: user.employeeId,
                        userEmail: user.email
                    },
                    true
                );
            }
        } else {
            // Notify user of rejection
            await this.sendNotification(
                'rejection',
                user._id.toString(),
                'user',
                {
                    userName: user.name,
                    remarks,
                    rejectedBy: 'Department Head'
                },
                true
            );
        }
    }

    // Send notifications for admin approval
    static async sendAdminApprovalNotifications(user: any, approved: boolean, remarks?: string) {
        await this.sendNotification(
            approved ? 'admin_approval' : 'rejection',
            user._id.toString(),
            'user',
            {
                userName: user.name,
                remarks,
                rejectedBy: approved ? undefined : 'Admin'
            },
            true
        );
    }

    static async sendAdminApprovalNotificationsToAdmin(user: any, approved: boolean, remarks?: string) {
        await this.sendNotification(
            approved ? 'admin_approval' : 'rejection',
            user._id.toString(),
            'admin',
            {
                userName: user.name,
                remarks,
                rejectedBy: approved ? undefined : 'Admin'
            },
            true
        );
    }
}