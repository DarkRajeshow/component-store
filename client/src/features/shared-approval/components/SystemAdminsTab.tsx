import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Shield } from 'lucide-react';
import { IAdmin } from '@/types/user.types';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '@/hooks';

interface SystemAdminsTabProps {
  admins: IAdmin[];
  onViewDetails: (admin: IAdmin) => void;
  onToggleAdminDisabled: (adminId: string) => void;
  onAdminApproval: (adminId: string, action: "approve" | "reject") => void;
}

export const SystemAdminsTab: React.FC<SystemAdminsTabProps> = ({
  admins,
  onViewDetails
}) => {

  const { user } = useAuth();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          System Administrators
        </CardTitle>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No system administrators</p>
            <p>No admin users found in the system</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map(admin => (
                <TableRow key={admin._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{admin.name + `${user?._id === admin._id && ' (You)'}`}</p>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {admin.isSystemAdmin ? 'System Admin' : 'Admin'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={admin.isApproved} />
                  </TableCell>
                  <TableCell>
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(admin)}
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