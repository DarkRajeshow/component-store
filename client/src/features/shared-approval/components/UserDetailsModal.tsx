import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Phone, Building, Shield, Clock, Check, X } from 'lucide-react';
import { IUser, ApprovalStatus, FinalApprovalStatus } from '@/types/user.types';
import { ApprovalRole } from '../types';

interface UserDetailsModalProps {
  user: IUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalRemarks: string;
  // onToggleUserDisabled: (userId: string) => void;
  setApprovalRemarks: (remarks: string) => void;
  handleUserApproval: (userId: string, action: 'approve' | 'reject', remarks?: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  role: ApprovalRole;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  open,
  onOpenChange,
  approvalRemarks,
  // onToggleUserDisabled,
  setApprovalRemarks,
  handleUserApproval,
  getStatusBadge,
  role
}) => {
  const isAdmin = role === 'admin';
  
  // Fix approval logic: Show approve/reject buttons when user is pending
  const canApprove = isAdmin 
    ? (user.dhApprovalStatus === ApprovalStatus.APPROVED || user.dhApprovalStatus === ApprovalStatus.NOT_REQUIRED) && user.adminApprovalStatus === ApprovalStatus.PENDING
    : user.dhApprovalStatus === ApprovalStatus.PENDING;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Details - {user.name}
            </DialogTitle>
            <DialogClose>
              <X />
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                <p className="font-medium">{user.employeeId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Mobile Number</Label>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {user.mobileNo}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Created At</Label>
                <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Updated At</Label>
                <p className="font-medium">{new Date(user.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Department & Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-4 h-4" />
                Department & Role
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Department</Label>
                <Badge variant="outline" className="mt-1">{user.department}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Designation</Label>
                <Badge variant="outline" className="mt-1">{user.designation}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <Badge variant="outline" className="mt-1">{user.role}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                <Badge className={`${user.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {user.isDisabled ? 'Disabled' : 'Enabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Approval Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Approval Status
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">DH Approval</Label>
                <div className="mt-1">{getStatusBadge(user.dhApprovalStatus)}</div>
              </div>
              {isAdmin && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Admin Approval</Label>
                  <div className="mt-1">{getStatusBadge(user.adminApprovalStatus)}</div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-500">Overall Status</Label>
                <div className="mt-1">
                  {user.isApproved === FinalApprovalStatus.PENDING ?
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge> :
                    user.isApproved === FinalApprovalStatus.APPROVED ? <Badge className="bg-green-100 text-green-800">Approved</Badge> :
                      <Badge className="bg-red-100 text-red-800">Not Approved</Badge>
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                {user.statusLogs && user.statusLogs.length > 0 ? (
                  <div className="space-y-2">
                    {user.statusLogs.map((log: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Badge variant="outline" className="text-xs">{log.status}</Badge>
                        <span className="text-sm">{log.message}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        {log.updatedBy && (
                          <span className="text-xs text-gray-400 ml-2">By: {log.updatedBy}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No status logs available</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Approval Actions */}
        {canApprove && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="remarks" className="text-sm font-medium">
                Approval Remarks (Optional)
              </Label>
              <Textarea
                id="remarks"
                placeholder="Add any remarks for approval/rejection..."
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => handleUserApproval(user._id, "reject", approvalRemarks)}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleUserApproval(user._id, "approve", approvalRemarks)}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 