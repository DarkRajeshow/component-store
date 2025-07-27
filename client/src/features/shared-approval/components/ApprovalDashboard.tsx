import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApprovalContext, ApprovalRole } from '../types';
import { StatusBadge } from './StatusBadge';
import { StatsCards } from './StatsCards';
import { PendingApprovalsTab } from './PendingApprovalsTab';
import { AllUsersTab } from './AllUsersTab';
import { SystemAdminsTab } from './SystemAdminsTab';
import { QuickActionsFooter } from './QuickActionsFooter';
import { DashboardHeader } from './DashboardHeader';
import { ErrorAlert } from './ErrorAlert';
import { LoadingSpinner } from './LoadingSpinner';
import { UserDetailsModal } from './UserDetailsModal';
import { AdminDetailsModal } from './AdminDetailsModal';
import { IAdmin, IUser } from '@/types/user.types';

interface ApprovalDashboardProps {
  role: ApprovalRole;
  context: ApprovalContext;
  title: string;
  subtitle?: string;
}

export const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({
  role,
  context,
  title,
  subtitle
}) => {
  const {
    // State
    users,
    admins,
    loading,
    error,
    selectedUser,
    selectedAdmin,
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
    setSelectedAdmin,
    setApprovalRemarks,
    setFilters,
    fetchData,
    handleToggleUserDisabled,
    handleToggleAdminDisabled,
    handleUserApproval,
    handleAdminApproval,
    resetFilters,
    deleteUser,
  } = context;

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  const handleViewDetails = (item: IUser | IAdmin) => {
    if (item.role === 'admin') {
      setSelectedAdmin?.(item as IAdmin);
    } else {
      setSelectedUser(item as IUser);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const isAdmin = role === 'admin';
  const pendingUsersCount = pendingUsers.length;
  const totalUsersCount = users.length;
  const totalAdminsCount = admins?.length || 0;

  return (
    <div className="p-6 mx-auto space-y-6">
      <DashboardHeader 
        title={title}
        subtitle={subtitle}
        onRefresh={fetchData} 
      />

      <ErrorAlert error={error} />

      {/* Stats Cards */}
      <StatsCards 
        users={users} 
        admins={admins} 
        pendingUsersCount={pendingUsersCount}
        role={role}
      />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingUsersCount})
          </TabsTrigger>
          <TabsTrigger value="users">
            All Users ({totalUsersCount})
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admins">
              System Admins ({totalAdminsCount})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <PendingApprovalsTab
            pendingUsers={pendingUsers}
            onViewDetails={handleViewDetails}
            onUserApproval={handleToggleUserDisabled}
            onAdminApproval={handleAdminApproval}
            role={role}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <AllUsersTab
            filteredUsers={filteredUsers}
            filters={filters}
            setFilters={setFilters}
            departments={departments}
            designations={designations}
            roles={roles}
            approvalStatuses={approvalStatuses}
            onResetFilters={resetFilters}
            onViewDetails={handleViewDetails}
            onToggleUserDisabled={handleToggleUserDisabled}
            onToggleAdminDisabled={handleToggleAdminDisabled}
            onUserApproval={handleToggleUserDisabled}
            onAdminApproval={handleAdminApproval}
            onDeleteUser={deleteUser}
            role={role}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admins" className="space-y-4">
            <SystemAdminsTab
              admins={admins || []}
              onViewDetails={setSelectedAdmin!}
              onToggleAdminDisabled={handleToggleAdminDisabled!}
              onAdminApproval={handleAdminApproval!}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Actions Footer */}
      <QuickActionsFooter
        users={users}
        admins={admins}
        pendingUsersCount={pendingUsersCount}
        role={role}
      />

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={open => { if (!open) setSelectedUser(null); }}
          approvalRemarks={approvalRemarks}
          // onToggleUserDisabled={handleToggleUserDisabled}
          setApprovalRemarks={setApprovalRemarks}
          handleUserApproval={handleUserApproval}
          getStatusBadge={getStatusBadge}
          role={role}
        />
      )}

      {selectedAdmin && isAdmin && (
        <AdminDetailsModal
          admin={selectedAdmin}
          open={!!selectedAdmin}
          onOpenChange={open => { if (!open) setSelectedAdmin?.(null); }}
          handleAdminApproval={handleAdminApproval!}
          onToggleAdminDisabled={handleToggleAdminDisabled!}
          approvalRemarks={approvalRemarks}
          setApprovalRemarks={setApprovalRemarks}
        />
      )}
    </div>
  );
}; 