import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationService';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  [key: string]: any;
}

export function useNotification() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user || !isAuthenticated) return;
    try {
      const { data } = await getNotifications();
      const { notifications, unreadCount } = data;
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user, isAuthenticated]);

  // Connect to socket.io and handle events
  useEffect(() => {
    if (!user || !isAuthenticated) return;
    fetchNotifications();
    if (socketRef.current) return;
    const apiUrl = (import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    const socket = io(apiUrl, {
      withCredentials: true,
      auth: { token: localStorage.getItem('accessToken') },
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.emit('get-unread-count', (data: { success: boolean; count: number }) => {
      if (data.success) setUnreadCount(data.count);
    });
    socket.on('new-notification', (data: { notification: Notification; unreadCount: number }) => {
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount(data.unreadCount);
      // Optionally: play sound, show popup
    });
    socket.on('notification-read', (data: { notificationId: string; unreadCount: number }) => {
      setNotifications((prev) => prev.map(n => n._id === data.notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(data.unreadCount);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, isAuthenticated, fetchNotifications]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    if (!socketRef.current) return;
    await markNotificationRead(notificationId);
    setNotifications((prev) => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    socketRef.current.emit('mark-notification-read', notificationId);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!socketRef.current) return;
    await markAllNotificationsRead();
    socketRef.current.emit('mark-all-notifications-read');
  };

  return {
    notifications,
    unreadCount,
    connected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
} 