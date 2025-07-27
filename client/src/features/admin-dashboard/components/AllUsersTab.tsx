import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, Trash2 } from 'lucide-react';
import { FilterBar } from './FilterBar';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { IUser } from '@/types/user.types';
import { FinalApprovalStatus } from '@/types/user.types';

interface Filters {
  search: string;
  department: string;
  designation: string;
  role: string;
  dhApprovalStatus: string;
  adminApprovalStatus: string;
  approvalStatus: string;
  dateRange: string;
  isDisabled: string;
}

interface AllUsersTabProps {
  filteredUsers: IUser[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  departments: string[];
  designations: string[];
  roles: string[];
  approvalStatuses: string[];
  onResetFilters: () => void;
  onViewDetails: (user: IUser) => void;
  onUserApproval: (userId: string, isApproved: FinalApprovalStatus) => void;
  onAdminApproval: (adminId: string, action: "approve" | "reject") => void;
  onToggleUserDisabled: (userId: string, isApproved: FinalApprovalStatus) => void;
  onToggleAdminDisabled: (adminId: string, isApproved: FinalApprovalStatus) => void;
  onDeleteUser: (userId: string) => void;
}

export const AllUsersTab: React.FC<AllUsersTabProps> = ({
  filteredUsers,
  filters,
  setFilters,
  departments,
  designations,
  roles,
  approvalStatuses,
  onResetFilters,
  onViewDetails,
  // onUserApproval,
  // onAdminApproval,
  onToggleUserDisabled,
  onToggleAdminDisabled,
  onDeleteUser
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          All Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          departments={departments}
          designations={designations}
          roles={roles}
          approvalStatuses={approvalStatuses}
          onResetFilters={onResetFilters}
        />
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className='bg-zinc-50'>
                <TableHead>User Details</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Toggle User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.employeeId || '-'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.department || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.designation || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.isApproved === FinalApprovalStatus.PENDING
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : user.isApproved === FinalApprovalStatus.APPROVED
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                      }
                      variant="outline"
                    >
                      {user.isApproved === FinalApprovalStatus.PENDING
                        ? 'Pending'
                        : user.isApproved === FinalApprovalStatus.APPROVED
                          ? 'Approved'
                          : 'Rejected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        tabIndex={0}
                        onClick={() => onViewDetails(user)}
                      >
                        <Eye className="size-5" />
                        {/* View Details */}
                      </Button>
                      {user.role === 'admin' && (
                        <Switch
                          checked={!user.isDisabled}
                          onCheckedChange={() => onToggleAdminDisabled(user._id, user.isApproved)}
                        />
                      )}


                      {!(user.role === 'admin') && (
                        <>
                          <Switch
                            checked={!user.isDisabled}
                            onCheckedChange={() => onToggleUserDisabled(user._id, user.isApproved)}
                          />
                          <AlertDialog open={deleteDialogOpen && userToDelete === user._id} onOpenChange={open => { setDeleteDialogOpen(open); if (!open) setUserToDelete(null); }}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setUserToDelete(user._id); setDeleteDialogOpen(true); }}
                              >
                                <Trash2 className='text-red-600' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this user? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className='bg-red-700 hover:bg-red-800' onClick={() => { onDeleteUser(user._id); setDeleteDialogOpen(false); setUserToDelete(null); }}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
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