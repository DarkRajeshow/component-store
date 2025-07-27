import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye } from 'lucide-react';
import { IUser, IAdmin } from '@/types/user.types';
import { ApprovalRole } from '../types';

interface PendingApprovalsTabProps {
  pendingUsers: (IUser | IAdmin)[];
  onViewDetails: (user: IUser | IAdmin) => void;
  onUserApproval: (userId: string) => void;
  onAdminApproval?: (adminId: string, action: "approve" | "reject") => void;
  role: ApprovalRole;
}

export const PendingApprovalsTab: React.FC<PendingApprovalsTabProps> = ({
  pendingUsers,
  onViewDetails,
  // onUserApproval,
  // onAdminApproval,
  role
}) => {
  const isAdmin = role === 'admin';
  const title = isAdmin ? 'Users & Admins Pending Approval' : 'Users Pending DH Approval';
  const emptyMessage = isAdmin 
    ? 'All users and admins have been processed'
    : 'All users in your department have been processed';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No pending approvals</p>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department / Role</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map(item => (
                <TableRow key={item._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.role === 'admin' ? 'Admin' : 'User'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.role === 'admin' ? item.role : (item as IUser).department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        tabIndex={0} 
                        onClick={() => onViewDetails(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}; 