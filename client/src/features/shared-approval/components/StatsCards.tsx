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
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{departmentUsersCount}</p>
              <p className="text-sm text-gray-600">
                {isAdmin ? 'Total Users' : 'Department Users'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{pendingUsersCount}</p>
              <p className="text-sm text-gray-600">
                {isAdmin ? 'Pending Approval' : 'Pending DH Approval'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{approvedUsersCount}</p>
              <p className="text-sm text-gray-600">
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
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{admins?.length || 0}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{users[0]?.department || 'N/A'}</p>
                <p className="text-sm text-gray-600">Department</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 