import { useEffect } from 'react';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useComponentNotifications(userId: string) {
  useEffect(() => {
    if (!userId) return;
    
    if (!socket) {
      const apiUrl = (import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      socket = io(apiUrl, {
        withCredentials: true,
        auth: { token: localStorage.getItem('accessToken') },
        transports: ['websocket'],
      });
    }
    
    socket.emit('join', { userId });

    const playAudio = () => {
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => console.warn('Could not play notification sound:', err));
      } catch (error) {
        console.warn('Error playing notification sound:', error);
      }
    };

    const handleComponentCreated = (data: any) => {
      playAudio();
      toast.success(data?.notification?.title || 'New Component Created', {
        description: data?.notification?.message,
        duration: 5000,
      });
    };

    const handleRevisionUploaded = (data: any) => {
      playAudio();
      toast.success(data?.notification?.title || 'New Revision Uploaded', {
        description: data?.notification?.message,
        duration: 5000,
      });
    };

    const handleComponentUpdated = (data: any) => {
      playAudio();
      toast.info(data?.notification?.title || 'Component Updated', {
        description: data?.notification?.message,
        duration: 4000,
      });
    };

    const handleComponentDeleted = (data: any) => {
      playAudio();
      toast.error(data?.notification?.title || 'Component Deleted', {
        description: data?.notification?.message,
        duration: 6000,
      });
    };

    // Listen for component-specific events
    socket.on('component-created', handleComponentCreated);
    socket.on('revision-uploaded', handleRevisionUploaded);
    socket.on('component-updated', handleComponentUpdated);
    socket.on('component-deleted', handleComponentDeleted);

    // Also listen for general notifications
    socket.on('new-notification', (data: any) => {
      if (data?.notification?.type?.includes('component') || data?.notification?.type?.includes('revision')) {
        playAudio();
        toast(data?.notification?.title || 'Notification', {
          description: data?.notification?.message,
          duration: 5000,
        });
      }
    });

    return () => {
      socket?.off('component-created', handleComponentCreated);
      socket?.off('revision-uploaded', handleRevisionUploaded);
      socket?.off('component-updated', handleComponentUpdated);
      socket?.off('component-deleted', handleComponentDeleted);
      socket?.off('new-notification');
    };
  }, [userId]);
} 