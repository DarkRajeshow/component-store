import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Shield, Mail, User, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { IAdmin } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@radix-ui/react-dialog';

interface AdminDetailsModalProps {
  admin: IAdmin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleAdminApproval: (adminId: string, action: "approve" | "reject", remarks?: string) => void;
  approvalRemarks: string;
  setApprovalRemarks: (remarks: string) => void;
}

const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({ admin, open, onOpenChange, handleAdminApproval, approvalRemarks, setApprovalRemarks }) => {
  const isActionDisabled = admin.isApproved === true || admin.isApproved === false;
  const statusBadge = admin.isApproved === true
    ? <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
    : admin.isApproved === false
      ? <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Admin Details - {admin.name}
            </DialogTitle>
            <DialogClose >
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
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <Badge variant="outline" className="mt-1">{admin.role}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">System Admin</Label>
                {admin.isSystemAdmin ? (
                  <Badge className="bg-green-100 text-green-800 mt-1">System Admin</Badge>
                ) : (
                  <Badge variant="outline" className="mt-1">Regular Admin</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Created At</Label>
                <p className="font-medium">{admin.createdAt ? new Date(admin.createdAt).toLocaleString() : '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Updated At</Label>
                <p className="font-medium">{admin.updatedAt ? new Date(admin.updatedAt).toLocaleString() : '-'}</p>
              </div>
            </CardContent>
          </Card>
          {/* Approval Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approval Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                {statusBadge}
              </div>
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-500">Remarks</Label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full mt-1"
                  value={approvalRemarks}
                  onChange={e => setApprovalRemarks(e.target.value)}
                  disabled={isActionDisabled}
                  placeholder="Add remarks (optional)"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  disabled={isActionDisabled}
                  onClick={() => handleAdminApproval(admin._id, "approve", approvalRemarks)}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  disabled={isActionDisabled}
                  onClick={() => handleAdminApproval(admin._id, "reject", approvalRemarks)}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDetailsModal;
