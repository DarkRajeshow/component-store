import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle, Shield } from 'lucide-react';
import { IUser, IAdmin, FinalApprovalStatus } from '@/types/user.types';

interface StatsCardsProps {
  users: IUser[];
  admins: IAdmin[];
  pendingUsersCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  users, 
  admins, 
  pendingUsersCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-gray-600">Total Users</p>
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
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.isApproved === FinalApprovalStatus.APPROVED).length}</p>
              <p className="text-sm text-gray-600">Approved Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{admins.length}</p>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};