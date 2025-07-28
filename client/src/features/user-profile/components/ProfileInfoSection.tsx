import { useState } from 'react';
import { UserProfile, AdminProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar,
  Shield,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ProfileInfoSectionProps {
  profile: UserProfile | AdminProfile;
  onUpdate: (updates: Partial<UserProfile | AdminProfile>) => void;
  loading: boolean;
}

export function ProfileInfoSection({ profile, onUpdate, loading }: ProfileInfoSectionProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    mobileNo: 'mobileNo' in profile ? profile.mobileNo : '',
  });

  const isAdmin = 'isSystemAdmin' in profile;
  const isUser = 'department' in profile;

  const handleSave = () => {
    onUpdate(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      mobileNo: 'mobileNo' in profile ? profile.mobileNo : '',
    });
    setEditMode(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className='h-full'>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
        <div className="flex space-x-2">
          {editMode ? (
            <>
              <Button onClick={handleSave} disabled={loading} size="sm">
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} size="sm">
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                {editMode ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={loading}
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <p className="text-lg font-medium">{profile.email}</p>
              </div>

              {isUser && (
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </Label>
                  {editMode ? (
                    <Input
                      id="mobile"
                      value={formData.mobileNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobileNo: e.target.value }))}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-lg font-medium">{profile.mobileNo}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <p className="text-lg font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isUser && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="w-4 h-4" />
                      Department
                    </Label>
                    <p className="text-lg font-medium">{profile.department}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="w-4 h-4" />
                      Designation
                    </Label>
                    <p className="text-lg font-medium">{profile.designation}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      Role
                    </Label>
                    <p className="text-lg font-medium capitalize">{profile.role}</p>
                  </div>

                  {profile.reportingManager && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <UserCheck className="w-4 h-4" />
                        Reporting Manager
                      </Label>
                      <div>
                        <p className="text-lg font-medium">{profile.reportingManager.name}</p>
                        <p className="text-sm text-muted-foreground">{profile.reportingManager.email}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isAdmin && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Admin Type
                  </Label>
                  <p className="text-lg font-medium">
                    {profile.isSystemAdmin ? 'System Administrator' : 'Administrator'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isUser && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <UserCheck className="w-4 h-4" />
                      Department Head Approval
                    </Label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(profile.dhApprovalStatus)}
                      {getStatusBadge(profile.dhApprovalStatus)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      Admin Approval
                    </Label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(profile.adminApprovalStatus)}
                      {getStatusBadge(profile.adminApprovalStatus)}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Final Status
                </Label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(profile.isApproved)}
                  {getStatusBadge(profile.isApproved)}
                </div>
              </div>

              {/* {profile.approvedBy && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4" />
                    Approved By
                  </Label>
                  <div>
                    <p className="text-lg font-medium">{profile.approvedBy.name}</p>
                    <p className="text-sm text-muted-foreground">{profile.approvedBy.email}</p>
                  </div>
                </div>
              )} */}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 