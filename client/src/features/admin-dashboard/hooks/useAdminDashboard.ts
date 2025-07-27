import { useApprovalDashboard } from '../../shared-approval/hooks/useApprovalDashboard';
import { adminService } from '../services/adminService';

export const useAdminDashboard = () => {
  return useApprovalDashboard({
    role: 'admin',
    service: adminService,
    includeAdmins: true
  });
};