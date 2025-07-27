import api from '@/lib/api';

export async function getNotifications() {
  const res = await api.get('/notifications');
  return res.data;
}

export async function markNotificationRead(notificationId: string) {
  return api.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead() {
  return api.patch('/notifications/read-all');
} 