import { useUserProfile } from '../hooks/useUserProfile';
import { EnhancedPreferencesForm } from '../components/EnhancedPreferencesForm';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PreferencesPage() {
  const { profile, loading, error, updatePreferences } = useUserProfile();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!profile || !('preferences' in profile)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences Not Available</h2>
          <p className="text-muted-foreground">Unable to load your preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/profile')}
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
        </div>

        {/* Enhanced Preferences Form */}
        <EnhancedPreferencesForm
          preferences={profile.preferences}
          onUpdate={updatePreferences}
          loading={loading}
        />
      </div>
    </div>
  );
} 