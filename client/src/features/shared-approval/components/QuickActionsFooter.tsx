import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle, Shield } from 'lucide-react';
import { IUser, IAdmin } from '@/types/user.types';
import { ApprovalRole } from '../types';

interface QuickActionsFooterProps {
  users: IUser[];
  admins?: IAdmin[];
  pendingUsersCount: number;
  role: ApprovalRole;
}

export const QuickActionsFooter: React.FC<QuickActionsFooterProps> = ({
  users,
  admins,
  pendingUsersCount,
  role
}) => {
  const isAdmin = role === 'admin';
  const totalUsers = users.length;
  const totalAdmins = admins?.length || 0;
  const approvedUsers = users.filter(u => u.isApproved === 'approved').length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-2xl font-bold">{totalUsers}</span>
            <span className="text-sm text-gray-600">
              {isAdmin ? 'Total Users' : 'Department Users'}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <Clock className="w-6 h-6 text-yellow-600 mb-2" />
            <span className="text-2xl font-bold">{pendingUsersCount}</span>
            <span className="text-sm text-gray-600">
              {isAdmin ? 'Pending Approval' : 'Pending DH Approval'}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-2xl font-bold">{approvedUsers}</span>
            <span className="text-sm text-gray-600">
              {isAdmin ? 'Approved Users' : 'Approved by DH'}
            </span>
          </div>
          
          {isAdmin ? (
            <div className="flex flex-col items-center">
              <Shield className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-2xl font-bold">{totalAdmins}</span>
              <span className="text-sm text-gray-600">Admins</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">{users[0]?.department || 'N/A'}</span>
              <span className="text-sm text-gray-600">Department</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 