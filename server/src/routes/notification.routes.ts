import { Router } from 'express';
import { markAllNotificationAsRead, deleteNotification, getUnreadCount, getUserNotifications, markNotificationAsRead } from '../controllers/notification.controller';
import { authenticateToken } from '../utils/auth';

const router = Router();

// All routes below are protected
router.use(authenticateToken);

/**
 * @route   GET /notifications
 * @desc    Get user notifications with pagination
 * @query   page, limit, unreadOnly
 */
router.get('/', getUserNotifications);

/**
 * @route   PATCH /notifications/:id/read
 * @desc    Mark specific notification as read
 */
router.patch('/:id/read', markNotificationAsRead);

/**
 * @route   PATCH /notifications/read-all
 * @desc    Mark all notifications as read
 */
router.patch('/read-all', markAllNotificationAsRead);

/**
 * @route   DELETE /notifications/:id
 * @desc    Delete a notification
 */
router.delete('/:id', deleteNotification);

/**
 * @route   GET /notifications/unread-count
 * @desc    Get count of unread notifications
 */
router.get('/unread-count', getUnreadCount);

export default router;
