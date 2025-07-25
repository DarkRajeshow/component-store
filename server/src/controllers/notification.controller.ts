// src/controllers/notification.controller.ts
import { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../utils/auth';

// Get user notifications
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const unreadOnly = req.query.unreadOnly === 'true';

        const result = await NotificationService.getUserNotifications(
            userId,
            page,
            limit,
            unreadOnly
        );

        if (!result) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications'
            });
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const notificationId = req.params.id; // Using 'id' to match the route parameter
        const userId = req.user!._id.toString();

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'Notification ID is required'
            });
        }

        const result = await NotificationService.markAsRead(notificationId, userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: result
        });

    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
};

// Mark all notifications as read
export const markAllNotificationAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();

        const result = await NotificationService.markAllAsRead(userId);

        if (!result) {
            return res.status(500).json({
                success: false,
                message: 'Failed to mark all notifications as read'
            });
        }

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });

    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
    try {
        const notificationId = req.params.id; // Using 'id' to match the route parameter
        const userId = req.user!._id.toString();

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'Notification ID is required'
            });
        }

        const result = await NotificationService.deleteNotification(notificationId, userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
};

// Get unread count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();

        const unreadCount = await NotificationService.getUnreadCount(userId);

        res.json({
            success: true,
            data: {
                unreadCount
            }
        });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            data: {
                unreadCount: 0
            }
        });
    }
};