import React from 'react';
import { ApprovalDashboard } from '../../shared-approval/components/ApprovalDashboard';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const AdminDashboard: React.FC = () => {
  const context = useAdminDashboard();

  return (
    <ApprovalDashboard
      role="admin"
      context={context}
      title="Admin Dashboard"
      subtitle="Manage users, approvals, and system administrators"
    />
  );
};

export default AdminDashboard;