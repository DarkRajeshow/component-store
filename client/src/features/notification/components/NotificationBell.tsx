import { useRef, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotification } from '../hooks/useNotification';

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount } = useNotification();
  const prevCount = useRef(unreadCount);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const enableAudio = () => setCanPlay(true);
    window.addEventListener('click', enableAudio, { once: true });
    window.addEventListener('keydown', enableAudio, { once: true });
    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };
  }, []);

  useEffect(() => {
    if (unreadCount > prevCount.current && canPlay) {
      audioRef.current?.play().catch(() => {});
    }
    prevCount.current = unreadCount;
  }, [unreadCount, canPlay]);

  return (
    <>
      <Button variant="ghost" className="relative p-2" onClick={onClick} aria-label="Notifications">
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-red-500 text-white">
            {unreadCount}
          </Badge>
        )}
      </Button>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </>
  );
} 