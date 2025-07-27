import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ApprovalStatus, Department, Designation, IAdmin, IUser, Role, FinalApprovalStatus } from '@/types/user.types';
import { ApprovalFilters, ApprovalContext, ApprovalRole, ApprovalService } from '../types';
import getErrorMessage from '@/utils/getErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { deleteUser as deleteUserAPI } from '@/lib/userAPI';

interface UseApprovalDashboardProps {
  role: ApprovalRole;
  service: ApprovalService;
  includeAdmins?: boolean;
}

export const useApprovalDashboard = ({ 
  role, 
  service, 
  includeAdmins = false 
}: UseApprovalDashboardProps): ApprovalContext => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [admins, setAdmins] = useState<IAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<IAdmin | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [filters, setFilters] = useState<ApprovalFilters>({
    search: '',
    department: 'all',
    designation: 'all',
    role: 'all',
    dhApprovalStatus: 'all',
    adminApprovalStatus: 'all',
    approvalStatus: 'all',
    dateRange: 'all',
    isDisabled: 'all',
  });

  const departments = ['Design', 'Machine Shop', 'Vendor Development', 'Maintenance', 'Production', 'Quality', 'Store', 'Pattern Shop', 'Testing', 'Other'];
  const designations = ['Department Head', 'Senior Manager', 'Manager', 'Assistant Manager', 'Employee'];
  const roles = ['admin', 'designer', 'other'];
  const approvalStatuses = ['pending', 'approved', 'rejected', 'not_required'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [service.getAllUsers()];
      
      if (includeAdmins && service.getAllAdmins) {
        promises.push(service.getAllAdmins());
      }

      const results = await Promise.all(promises);
      setUsers(results[0].users || []);
      
      if (includeAdmins && results[1]) {
        setAdmins(results[1].admins || []);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserDisabled = async (userId: string) => {
    try {
      const response = await service.toggleUserDisabled(userId);
      if (response.success) {
        setUsers(users => users.map(u => u._id === userId ? { ...u, isDisabled: response.isDisabled } : u));
        setSelectedUser(user => user && user._id === userId ? { ...user, isDisabled: response.isDisabled } : user);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const error = getErrorMessage(err);
      setError(error);
      toast.error(error);
    }
  };

  const handleToggleAdminDisabled = async (adminId: string) => {
    if (!service.toggleAdminDisabled) return;
    
    try {
      const response = await service.toggleAdminDisabled(adminId);
      if (response.success) {
        setAdmins(admins => admins.map(a => a._id === adminId ? { ...a, isDisabled: response.isDisabled } : a));
        setSelectedAdmin(admin => admin && admin._id === adminId ? { ...admin, isDisabled: response.isDisabled } : admin);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const error = getErrorMessage(err);
      setError(error);
      toast.error(error);
    }
  };

  const handleUserApproval = async (userId: string, action: "approve" | "reject", remarks?: string) => {
    try {
      const response = await service.approveUser(userId, action, remarks);
      
      if (role === 'admin') {
        setUsers(users => users.map(u =>
          u._id === userId
            ? {
                ...u,
                adminApprovalStatus: action === "approve" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
                isApproved: action === "approve" ? FinalApprovalStatus.APPROVED : FinalApprovalStatus.REJECTED
              }
            : u
        ));
      } else {
        // For DH, update dhApprovalStatus
        setUsers(users => users.map(u =>
          u._id === userId
            ? {
                ...u,
                dhApprovalStatus: action === "approve" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
              }
            : u
        ));
      }
      
      setApprovalRemarks('');
      setSelectedUser(null);
      toast.success(response.message);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const handleAdminApproval = async (adminId: string, action: "approve" | "reject", remarks?: string) => {
    if (!service.approveAdmin) return;
    
    try {
      const response = await service.approveAdmin(adminId, action, remarks);
      setAdmins(admins => admins.map(a => a._id === adminId ? { ...a, isApproved: action === "approve" ? FinalApprovalStatus.APPROVED : FinalApprovalStatus.REJECTED } : a));
      setSelectedAdmin(null);
      toast.success(response.message);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const filteredUsers = useMemo(() => {
    let allUsers: IUser[] = [...users];
    
    if (includeAdmins) {
      // Combine users and admins for display in All Users tab (admin only)
      allUsers = [
        ...users.map(user => ({
          ...user,
          isApproved: user.isApproved,
        } as IUser)),
        ...admins.map(admin => ({
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          employeeId: '-',
          mobileNo: '-',
          department: Department.OTHER,
          designation: Designation.DEPARTMENT_HEAD,
          role: Role.ADMIN,
          dhApprovalStatus: ApprovalStatus.NOT_REQUIRED,
          adminApprovalStatus: ApprovalStatus.NOT_REQUIRED,
          isApproved: admin.isApproved,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
          isSystemAdmin: admin.isSystemAdmin,
          isDisabled: admin.isDisabled,
          statusLogs: [],
        } as IUser))
      ];
    }

    // Filter out current user
    allUsers = allUsers.filter(user => !currentUser || user._id !== currentUser._id);

    return allUsers.filter(user => {
      const matchesSearch = !filters.search ||
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(filters.search.toLowerCase())) ||
        (user.mobileNo && user.mobileNo.includes(filters.search));

      const matchesDepartment = !filters.department || filters.department === 'all' || user.department === filters.department;
      const matchesDesignation = !filters.designation || filters.designation === 'all' || user.designation === filters.designation;
      const matchesRole = !filters.role || filters.role === 'all' || user.role === filters.role;
      const matchesDhApproval = !filters.dhApprovalStatus || filters.dhApprovalStatus === 'all' || user.dhApprovalStatus === filters.dhApprovalStatus;
      const matchesAdminApproval = !filters.adminApprovalStatus || filters.adminApprovalStatus === 'all' || user.adminApprovalStatus === filters.adminApprovalStatus;

      const matchesApprovalStatus = !filters.approvalStatus || filters.approvalStatus === 'all' ||
        (filters.approvalStatus === 'approved' && user.isApproved === FinalApprovalStatus.APPROVED) ||
        (filters.approvalStatus === 'pending' && user.isApproved === FinalApprovalStatus.PENDING) ||
        (filters.approvalStatus === 'rejected' && user.adminApprovalStatus === 'rejected');

      const matchesDateRange = !filters.dateRange || filters.dateRange === 'all' || (() => {
        const userDate = new Date(user.createdAt);
        const now = new Date();
        switch (filters.dateRange) {
          case 'today':
            return userDate.toDateString() === now.toDateString();
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return userDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return userDate >= monthAgo;
          }
          default:
            return true;
        }
      })();

      const matchesIsDisabled = !filters.isDisabled || filters.isDisabled === 'all' ||
        (filters.isDisabled === 'enabled' && !user.isDisabled) ||
        (filters.isDisabled === 'disabled' && user.isDisabled);

      return matchesSearch && matchesDepartment && matchesDesignation &&
        matchesRole && matchesDhApproval && matchesAdminApproval &&
        matchesApprovalStatus && matchesDateRange && matchesIsDisabled;
    });
  }, [users, admins, filters, currentUser, includeAdmins]);

  const pendingUsers = useMemo(() => {
    if (role === 'admin') {
      return [
        ...users.filter(u =>
          u.dhApprovalStatus?.toLowerCase() === "approved" &&
          u.adminApprovalStatus?.toLowerCase() === "pending"
        ),
        ...admins.filter(a => a.isApproved === FinalApprovalStatus.PENDING)
      ];
    } else {
      // For DH, only show users pending DH approval from their department
      return users.filter(u => u.dhApprovalStatus?.toLowerCase() === "pending");
    }
  }, [users, admins, role]);

  const resetFilters = () => {
    setFilters({
      search: '',
      department: 'all',
      designation: 'all',
      role: 'all',
      dhApprovalStatus: 'all',
      adminApprovalStatus: 'all',
      approvalStatus: 'all',
      dateRange: 'all',
      isDisabled: 'all',
    });
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await deleteUserAPI(userId);
      if (response.success) {
        setUsers(users => users.filter(u => u._id !== userId));
        toast.success(response.message);
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (err: unknown) {
      const error = getErrorMessage(err);
      toast.error(error || 'Failed to delete user');
    }
  };

  return {
    // State
    users,
    admins: includeAdmins ? admins : undefined,
    loading,
    error,
    selectedUser,
    selectedAdmin: includeAdmins ? selectedAdmin : undefined,
    approvalRemarks,
    filters,

    // Constants
    departments,
    designations,
    roles,
    approvalStatuses,

    // Computed values
    filteredUsers,
    pendingUsers,

    // Actions
    setSelectedUser,
    setSelectedAdmin: includeAdmins ? setSelectedAdmin : undefined,
    setApprovalRemarks,
    setFilters,
    fetchData,
    handleToggleUserDisabled,
    handleToggleAdminDisabled: includeAdmins ? handleToggleAdminDisabled : undefined,
    handleUserApproval,
    handleAdminApproval: includeAdmins ? handleAdminApproval : undefined,
    resetFilters,
    deleteUser,
    setError,
  };
}; 