import { useNotification } from '../hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export function NotificationList({ previewMode = true }: { previewMode?: boolean }) {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const displayNotifications = previewMode ? notifications.slice(0, 3) : notifications;

  return (
    <Card className="w-full max-w-full gap-2 p-0 shadow-none border-none">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        {previewMode && (
          <Link to="/notifications">
            <div className='hover:border-b font-semibold hover:border-b-zinc-800'>
              Notifications
            </div>
          </Link>
        )}
        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>
      <div className="overflow-y-auto pb-10">
        {displayNotifications && displayNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          displayNotifications && displayNotifications.map((n) => (
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