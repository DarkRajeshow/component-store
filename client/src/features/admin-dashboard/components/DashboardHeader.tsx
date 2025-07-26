import React from 'react';
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, approvals, and system administrators</p>
      </div>
      <Button onClick={onRefresh} variant="outline">
        <Users className="w-4 h-4 mr-2" />
        Refresh Data
      </Button>
    </div>
  );
};