import { UserProfile, AdminProfile } from '../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  UserCheck,
  Crown,
  Mail,
  Hash
} from 'lucide-react';

interface ProfileHeaderProps {
  profile: UserProfile | AdminProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const isAdmin = 'isSystemAdmin' in profile;
  const isUser = 'department' in profile;
  
  const getStatusIcon = () => {
    if (isUser) {
      if (profile.isApproved === 'approved') return <CheckCircle className="w-4 h-4 text-green-600" />;
      if (profile.isApproved === 'rejected') return <XCircle className="w-4 h-4 text-red-600" />;
      return <Clock className="w-4 h-4 text-amber-600" />;
    }
    return null;
  };

  const getStatusBadge = () => {
    if (isUser) {
      switch (profile.isApproved) {
        case 'approved':
          return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
        case 'rejected':
          return <Badge variant="destructive">Rejected</Badge>;
        default:
          return <Badge variant="secondary">Pending</Badge>;
      }
    }
    return null;
  };

  const getRoleIcon = () => {
    if (isAdmin) {
      return profile.isSystemAdmin ? <Crown className="w-5 h-5 text-amber-600" /> : <Shield className="w-5 h-5 text-blue-600" />;
    }
    return <User className="w-5 h-5 text-gray-600" />;
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="py-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-semibold">{profile.name}</h1>
                {getRoleIcon()}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              
              {isUser && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{profile.department} • {profile.designation}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              {getStatusBadge()}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Hash className="w-4 h-4" />
              <span className="font-mono">
                {isUser ? profile.employeeId : 'ADMIN'}
              </span>
            </div>
            
            {isAdmin && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <UserCheck className="w-4 h-4" />
                <span>{profile.isSystemAdmin ? 'System Administrator' : 'Administrator'}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 