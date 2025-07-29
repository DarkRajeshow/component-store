import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Shield, Clock, Check, X, UserCheck } from 'lucide-react';
import { IAdmin, FinalApprovalStatus } from '@/types/user.types';

interface AdminDetailsModalProps {
  admin: IAdmin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleAdminApproval: (adminId: string, action: 'approve' | 'reject', remarks?: string) => void;
  onToggleAdminDisabled: (adminId: string) => void;
  approvalRemarks: string;
  setApprovalRemarks: (remarks: string) => void;
}

export const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({
  admin,
  open,
  onOpenChange,
  handleAdminApproval,
  approvalRemarks,
  setApprovalRemarks
}) => {
  const canApprove = admin.isApproved === FinalApprovalStatus.PENDING;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Details - {admin.name}
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
                <p className="font-medium">{admin.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {admin.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Admin Type</Label>
                <Badge variant="outline" className="mt-1">
                  {admin.isSystemAdmin ? 'System Admin' : 'Admin'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                <Badge className={`${admin.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {admin.isDisabled ? 'Disabled' : 'Enabled'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Created Date</Label>
                <p className="font-medium">
                  {admin.createdAt ? new Date(admin.createdAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Updated Date</Label>
                <p className="font-medium">
                  {admin.updatedAt ? new Date(admin.updatedAt).toLocaleString() : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Approver */}
          {admin.approvedBy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Approver
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="font-medium">{(admin.approvedBy as IAdmin)?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {(admin.approvedBy as IAdmin)?.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Approval Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge
                  className={
                    admin.isApproved === FinalApprovalStatus.PENDING
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                      : admin.isApproved === FinalApprovalStatus.APPROVED
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-red-100 text-red-800 border-red-300"
                  }
                  variant="outline"
                >
                  {admin.isApproved === FinalApprovalStatus.PENDING
                    ? 'Pending'
                    : admin.isApproved === FinalApprovalStatus.APPROVED
                      ? 'Approved'
                      : 'Rejected'}
                </Badge>
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
                {admin.statusLogs && admin.statusLogs.length > 0 ? (
                  <div className="space-y-2">
                    {admin.statusLogs.map((log: any, index: number) => (
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
                onClick={() => handleAdminApproval(admin._id, "reject", approvalRemarks)}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleAdminApproval(admin._id, "approve", approvalRemarks)}
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