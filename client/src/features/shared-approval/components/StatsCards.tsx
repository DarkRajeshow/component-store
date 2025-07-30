import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle, Shield, Building } from 'lucide-react';
import { IUser, IAdmin, FinalApprovalStatus } from '@/types/user.types';
import { ApprovalRole } from '../types';

interface StatsCardsProps {
  users: IUser[];
  admins?: IAdmin[];
  pendingUsersCount: number;
  role: ApprovalRole;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  users, 
  admins, 
  pendingUsersCount,
  role
}) => {
  const isAdmin = role === 'admin';
  const approvedUsersCount = users.filter(u => u.isApproved === FinalApprovalStatus.APPROVED).length;
  const departmentUsersCount = users.length; // For DH, this is already filtered by department

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-foreground">{departmentUsersCount + approvedUsersCount + 1}</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? 'Total Users' : 'Department Users'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingUsersCount}</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? 'Pending Approval' : 'Pending DH Approval'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedUsersCount}</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? 'Approved Users' : 'Approved by DH'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{admins?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{users[0]?.department || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Department</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 