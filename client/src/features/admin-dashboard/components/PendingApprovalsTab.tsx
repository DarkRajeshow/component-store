import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye } from 'lucide-react';
import { IUser, IAdmin } from '@/types/user.types';

interface PendingApprovalsTabProps {
  pendingUsers: (IUser | IAdmin)[];
  onViewDetails: (item: IUser | IAdmin) => void;
  onUserApproval: (userId: string, isApproved: boolean) => void;
  onAdminApproval: (adminId: string, action: "approve" | "reject") => void;
}

export const PendingApprovalsTab: React.FC<PendingApprovalsTabProps> = ({
  pendingUsers,
  onViewDetails,
  onUserApproval,
  onAdminApproval
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Users & Admins Pending Approval
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No pending approvals</p>
            <p>All users and admins have been processed</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department / Role</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Approve User</TableHead>
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
                    <Badge variant="outline">{item.role === 'admin' ? item.role : (item as IUser).department}</Badge>
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
                      {item.role === 'admin' ? (
                        <Switch
                          checked={!!item.isApproved}
                          onCheckedChange={checked => onAdminApproval(item._id, checked ? "approve" : "reject")}
                        />
                      ) : (
                        <Switch
                          checked={!!item.isApproved}
                          onCheckedChange={checked => onUserApproval(item._id, checked)}
                          disabled={(item as IUser).adminApprovalStatus === 'rejected'}
                        />
                      )}
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