import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Power, PowerOff } from 'lucide-react';
import { IUser, IAdmin, FinalApprovalStatus } from '@/types/user.types';
import { ApprovalFilters, ApprovalRole } from '../types';
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

interface AllUsersTabProps {
  filteredUsers: IUser[];
  filters: ApprovalFilters;
  setFilters: (filters: Partial<ApprovalFilters>) => void;
  departments: string[];
  designations: string[];
  roles: string[];
  approvalStatuses: string[];
  onResetFilters: () => void;
  onViewDetails: (user: IUser | IAdmin) => void;
  onToggleUserDisabled: (userId: string) => void;
  onToggleAdminDisabled?: (adminId: string) => void;
  onUserApproval: (userId: string) => void;
  onAdminApproval?: (adminId: string, action: "approve" | "reject") => void;
  onDeleteUser: (userId: string) => void;
  role: ApprovalRole;
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
  onToggleUserDisabled,
  // onToggleAdminDisabled,
  // onUserApproval,
  // onAdminApproval,
  onDeleteUser,
  // role
}) => {
  // const isAdmin = role === 'admin';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<{ id: string; isDisabled: boolean } | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>All Users</span>
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
            <p className="text-lg font-medium">No users found</p>
            <p>Try adjusting your filters</p>
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
                <TableHead>Actions</TableHead>
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
                    <div className="flex gap-2 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(user)}
                      >
                        <Eye className="size-5" />
                      </Button>

                      {/* Enable/Disable Toggle */}
                      {
                        user.role !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUserToToggle({ id: user._id, isDisabled: user.isDisabled });
                              setDisableDialogOpen(true);
                            }}
                            className={user.isDisabled ? "text-green-600" : "text-red-600"}
                          >
                            {user.isDisabled ? <Power className="size-5" /> : <PowerOff className="size-5" />}
                          </Button>
                        )
                      }

                      {/* Delete Button - Only for non-admin users */}
                      {user.role !== 'admin' && (
                        <AlertDialog
                          open={deleteDialogOpen && userToDelete === user._id}
                          onOpenChange={(open) => {
                            setDeleteDialogOpen(open);
                            if (!open) setUserToDelete(null);
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user._id);
                                setDeleteDialogOpen(true);
                              }}
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
                              <AlertDialogAction
                                className='bg-red-700 hover:bg-red-800'
                                onClick={() => {
                                  onDeleteUser(user._id);
                                  setDeleteDialogOpen(false);
                                  setUserToDelete(null);
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Disable/Enable Confirmation Dialog */}
        <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {userToToggle?.isDisabled ? 'Enable' : 'Disable'} User
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {userToToggle?.isDisabled ? 'enable' : 'disable'} this user?
                {userToToggle?.isDisabled ? ' They will be able to access the system again.' : ' They will not be able to access the system.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (userToToggle) {
                    onToggleUserDisabled(userToToggle.id);
                    setDisableDialogOpen(false);
                    setUserToToggle(null);
                  }
                }}
              >
                {userToToggle?.isDisabled ? 'Enable' : 'Disable'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}; 