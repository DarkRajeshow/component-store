import { useState } from 'react';
import { UserPreferences } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Palette, 
  Layout, 
  Mail, 
  Smartphone, 
  Volume2, 
  Zap,
  Sun,
  Moon,
  Grid,
  List,
  CheckCircle
} from 'lucide-react';

interface EnhancedPreferencesFormProps {
  preferences: UserPreferences;
  onUpdate: (updates: Partial<UserPreferences>) => void;
  loading: boolean;
}

export function EnhancedPreferencesForm({ preferences, onUpdate, loading }: EnhancedPreferencesFormProps) {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof UserPreferences['notifications']) => {
    setLocalPrefs(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
    setSaved(false);
  };

  const handleThemeToggle = () => {
    setLocalPrefs(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
    setSaved(false);
  };

  const handleLayoutChange = (layout: 'list' | 'grid') => {
    setLocalPrefs(prev => ({ ...prev, layout }));
    setSaved(false);
  };

  const handleSave = async () => {
    await onUpdate(localPrefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges = JSON.stringify(localPrefs) !== JSON.stringify(preferences);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Preferences</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your experience and notification settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme & Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-gray-500">Choose your preferred color scheme</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Light</span>
                  </div>
                  <Switch 
                    checked={localPrefs.theme === 'dark'} 
                    onCheckedChange={handleThemeToggle} 
                    disabled={loading} 
                  />
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Dark</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="w-fit">
                {localPrefs.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Badge>
            </div>

            <Separator />

            {/* Layout */}
            <div className="space-y-3">
              <div>
                <h3 className="font-medium mb-2">Layout</h3>
                <p className="text-sm text-gray-500 mb-3">Choose how content is displayed</p>
                <Select value={localPrefs.layout} onValueChange={handleLayoutChange} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">
                      <div className="flex items-center gap-2">
                        <List className="w-4 h-4" />
                        List View
                      </div>
                    </SelectItem>
                    <SelectItem value="grid">
                      <div className="flex items-center gap-2">
                        <Grid className="w-4 h-4" />
                        Grid View
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="w-fit">
                {localPrefs.layout === 'list' ? 'List Layout' : 'Grid Layout'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                </div>
                <Switch 
                  checked={localPrefs.notifications.email} 
                  onCheckedChange={() => handleToggle('email')} 
                  disabled={loading} 
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="font-medium">In-App Notifications</h3>
                    <p className="text-sm text-gray-500">Show notifications in the app</p>
                  </div>
                </div>
                <Switch 
                  checked={localPrefs.notifications.inApp} 
                  onCheckedChange={() => handleToggle('inApp')} 
                  disabled={loading} 
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-purple-500" />
                  <div>
                    <h3 className="font-medium">Sound Alerts</h3>
                    <p className="text-sm text-gray-500">Play sound for notifications</p>
                  </div>
                </div>
                <Switch 
                  checked={localPrefs.notifications.sound} 
                  onCheckedChange={() => handleToggle('sound')} 
                  disabled={loading} 
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Browser push notifications</p>
                  </div>
                </div>
                <Switch 
                  checked={localPrefs.notifications.push} 
                  onCheckedChange={() => handleToggle('push')} 
                  disabled={loading} 
                />
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Notification Summary
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p>• Email: {localPrefs.notifications.email ? 'Enabled' : 'Disabled'}</p>
                <p>• In-App: {localPrefs.notifications.inApp ? 'Enabled' : 'Disabled'}</p>
                <p>• Sound: {localPrefs.notifications.sound ? 'Enabled' : 'Disabled'}</p>
                <p>• Push: {localPrefs.notifications.push ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleSave} 
          disabled={loading || !hasChanges}
          className="min-w-[200px]"
        >
          {loading ? (
            'Saving...'
          ) : saved ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Saved!
            </div>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  );
} 