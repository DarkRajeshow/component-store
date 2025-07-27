import { useApprovalDashboard } from '../../shared-approval/hooks/useApprovalDashboard';
import { dhService } from '../services/dhService';

export const useDhDashboard = () => {
  return useApprovalDashboard({
    role: 'department_head',
    service: dhService,
    includeAdmins: false
  });
}; 