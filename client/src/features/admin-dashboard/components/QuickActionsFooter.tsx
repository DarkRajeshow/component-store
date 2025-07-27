import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IUser, IAdmin, FinalApprovalStatus } from '@/types/user.types';

interface QuickActionsFooterProps {
  users: IUser[];
  admins: IAdmin[];
  pendingUsersCount: number;
}

export const QuickActionsFooter: React.FC<QuickActionsFooterProps> = ({
  users,
  admins,
  pendingUsersCount
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              Total Users: {users.length + admins.length}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Pending: {pendingUsersCount}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Approved: {users.filter(u => u.isApproved === FinalApprovalStatus.APPROVED).length}
            </Badge>
          </div>
          <div className="flex gap-2">
            {/* Remove Export Users, Generate Report, Bulk Actions if not functional */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};