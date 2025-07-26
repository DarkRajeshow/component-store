import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'approved':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    case 'not_required':
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Not Required
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};