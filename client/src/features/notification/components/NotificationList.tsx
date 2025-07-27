import { useNotification } from '../hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function NotificationList() {
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  return (
    <Card className="w-80 max-h-96 gap-2 p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="font-semibold">Notifications</span>
        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>
      <div className="h-72 overflow-y-auto pb-10">
        {notifications && notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          notifications && notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 cursor-pointer ${n.isRead ? '' : 'bg-muted'}`}
              onClick={() => markAsRead(n._id)}
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.isRead && <Badge className="ml-2" variant="secondary">New</Badge>}
            </div>
          ))
        )}
      </div>
    </Card>
  );
} 