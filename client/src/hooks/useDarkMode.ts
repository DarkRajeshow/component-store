import { useCallback, useMemo, useRef } from 'react';
import { useUserProfile } from '@/features/user-profile/hooks/useUserProfile';
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
  // Merge with default preferences to ensure all fields are present
  const preferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...(profile?.preferences || {}),
    notifications: {
      ...DEFAULT_PREFERENCES.notifications,
      ...(profile?.preferences?.notifications || {}),
    },
  };
  const theme = preferences.theme || 'light';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play sound effect (optional)
  const playSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(TOGGLE_SOUND);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  // Toggle theme handler
  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    // Optimistically update the class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    playSound();
    // Only update the theme field, keep all other preferences as is
    await updatePreferences({ ...preferences, theme: newTheme });
    // (The effect in useUserProfile will ensure the class is correct after update)
  }, [theme, updatePreferences, playSound, preferences]);

  // Memoize return value
  return useMemo(() => ({
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLoading: loading,
  }), [theme, toggleTheme, loading]);
} 