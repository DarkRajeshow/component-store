import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Eye, User, Mail, Users } from 'lucide-react';
import { IAdmin } from '@/types/user.types';

interface SystemAdminsTabProps {
  admins: IAdmin[];
  onViewDetails: (admin: IAdmin) => void;
  onAdminApproval: (adminId: string, action: "approve" | "reject") => void;
  onToggleAdminDisabled: (adinId: string, isDisabled: boolean) => void;
}

export const SystemAdminsTab: React.FC<SystemAdminsTabProps> = ({
  admins,
  onViewDetails,
  // onAdminApproval,
  onToggleAdminDisabled
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Administrators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='bg-zinc-50'>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>System Admin Status</TableHead>
                <TableHead>Toggle User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map(admin => (
                <TableRow key={admin._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {admin.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {admin.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center gap-2">
                      <span className={admin.isSystemAdmin ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {admin.isSystemAdmin ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            System Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Regular Admin
                          </Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-4 justify-center'>
                      <Button onClick={() => onViewDetails(admin)} variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>

                      <Switch
                        checked={!admin.isDisabled}
                        onCheckedChange={() => onToggleAdminDisabled(admin._id, !admin.isDisabled)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => {/* logic to add new admin */ }}>
              <Users className="w-4 h-4 mr-2" />
              Add New Admin
            </Button>
            {/* Remove Bulk Admin Actions and Admin Activity Log buttons if not functional */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};