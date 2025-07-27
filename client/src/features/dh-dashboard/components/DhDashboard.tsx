import React from 'react';
import { ApprovalDashboard } from '../../shared-approval/components/ApprovalDashboard';
import { useDhDashboard } from '../hooks/useDhDashboard';

const DhDashboard: React.FC = () => {
  const context = useDhDashboard();

  return (
    <ApprovalDashboard
      role="department_head"
      context={context}
      title="Department Head Dashboard"
      subtitle="Manage user approvals for your department"
    />
  );
};

export default DhDashboard;
