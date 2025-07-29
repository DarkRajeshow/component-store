import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useUserProfile } from '@/features/user-profile/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { UserPreferences } from '@/types/user.types';

// Optional: Path to your sound file (put a short chime/click in public/ if you want sound)
const TOGGLE_SOUND = '/notification.mp3';

// Default preferences to use if missing or incomplete
const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: {
    email: true,
    inApp: true,
    sound: true,
    push: false,
  },
  theme: 'light',
  layout: 'list',
};

export function useDarkMode() {
  const { profile, updatePreferences, loading } = useUserProfile();
  const { isAuthenticated } = useAuth();
  
  // Merge with default preferences to ensure all fields are present
  const currentPreferences = useMemo(() => {
    if (!profile?.preferences) {
      return DEFAULT_PREFERENCES;
    }
    return {
      ...DEFAULT_PREFERENCES,
      ...profile.preferences,
    };
  }, [profile?.preferences]);

  const theme = currentPreferences.theme || 'light';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset theme to light when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // Remove dark class and set theme to light when not authenticated
      document.documentElement.classList.remove('dark');
      // Clear any stored theme preference for non-authenticated users
      localStorage.removeItem('theme');
    }
  }, [isAuthenticated]);

  // Apply user's theme preference when authenticated
  useEffect(() => {
    if (isAuthenticated && profile) {
      // Apply the user's saved theme preference
      const userTheme = currentPreferences.theme || 'light';
      document.documentElement.classList.toggle('dark', userTheme === 'dark');
    }
  }, [isAuthenticated, profile, currentPreferences.theme]);

  // Play sound effect (optional)
  const playSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(TOGGLE_SOUND);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Ignore audio play errors
    });
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(async () => {
    if (!isAuthenticated) {
      // Don't allow theme toggle when not authenticated
      return;
    }

    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Update local state immediately for instant UI feedback
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Play sound effect
    playSound();

    try {
      // Update backend with merged preferences (only theme field changes)
      await updatePreferences({
        ...currentPreferences,
        theme: newTheme,
      });
    } catch (error) {
      console.error('Failed to update theme preference:', error);
      // Revert local state if backend update fails
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, isAuthenticated, currentPreferences, updatePreferences, playSound]);

  const isDark = theme === 'dark';

  return {
    theme,
    toggleTheme,
    isDark,
    isLoading: loading,
    isAuthenticated,
  };
} 