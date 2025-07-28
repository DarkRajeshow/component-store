import { UserPreferences } from '../types';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

interface PreferencesFormProps {
  preferences: UserPreferences;
  onUpdate: (updates: Partial<UserPreferences>) => void;
  loading: boolean;
}

export function PreferencesForm({ preferences, onUpdate, loading }: PreferencesFormProps) {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleToggle = (key: keyof UserPreferences['notifications']) => {
    setLocalPrefs(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleThemeToggle = () => {
    setLocalPrefs(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleLayoutChange = (layout: 'list' | 'grid') => {
    setLocalPrefs(prev => ({ ...prev, layout }));
  };

  const handleSave = () => {
    onUpdate(localPrefs);
  };

  return (
    <Card className="max-w-xl mx-auto p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Preferences</h2>

      {preferences && (

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <div className="flex items-center gap-2">
              <span>Light</span>
              <Switch checked={localPrefs.theme === 'dark'} onCheckedChange={handleThemeToggle} disabled={loading} />
              <span>Dark</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Layout</label>
            <Select value={localPrefs.layout} onValueChange={handleLayoutChange} disabled={loading}>
              <option value="list">List</option>
              <option value="grid">Grid</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notifications</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch checked={localPrefs.notifications.email} onCheckedChange={() => handleToggle('email')} disabled={loading} />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={localPrefs.notifications.inApp} onCheckedChange={() => handleToggle('inApp')} disabled={loading} />
                <span>In-App</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={localPrefs.notifications.sound} onCheckedChange={() => handleToggle('sound')} disabled={loading} />
                <span>Sound</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={localPrefs.notifications.push} onCheckedChange={() => handleToggle('push')} disabled={loading} />
                <span>Push</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-2 mt-6">
        <Button onClick={handleSave} disabled={loading}>Save Preferences</Button>
      </div>
    </Card>
  );
} 