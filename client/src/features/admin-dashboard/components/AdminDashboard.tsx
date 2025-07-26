import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UserDetailsModal from './UserDetailsModal';
import AdminDetailsModal from './AdminDetailsModal';
import { useAdminDashboard } from './useAdminDashboard';
import { StatusBadge } from './StatusBadge';
import { StatsCards } from './StatsCards';
import { PendingApprovalsTab } from './PendingApprovalsTab';
import { AllUsersTab } from './AllUsersTab';
import { SystemAdminsTab } from './SystemAdminsTab';
import { QuickActionsFooter } from './QuickActionsFooter';
import { DashboardHeader } from './DashboardHeader';
import { ErrorAlert } from './ErrorAlert';
import { LoadingSpinner } from './LoadingSpinner';

const AdminDashboard: React.FC = () => {
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
    HandleToggleUserDisabled,
    HandleToggleAdminDisabled,
    handleAdminFinalApproval,
    handleAdminApproval,
    resetFilters,
    deleteUser,
  } = useAdminDashboard();

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  const handleViewDetails = (item: any) => {
    if (item.role === 'admin') {
      setSelectedAdmin(item);
    } else {
      setSelectedUser(item);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <DashboardHeader onRefresh={fetchData} />

      <ErrorAlert error={error} />

      {/* Stats Cards */}
      <StatsCards 
        users={users} 
        admins={admins} 
        pendingUsersCount={pendingUsers.length} 
      />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Approvals ({pendingUsers.length})</TabsTrigger>
          <TabsTrigger value="users">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="admins">System Admins ({admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <PendingApprovalsTab
            pendingUsers={pendingUsers}
            onViewDetails={handleViewDetails}
            onUserApproval={HandleToggleUserDisabled}
            onAdminApproval={handleAdminApproval}
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
            onToggleUserDisabled={HandleToggleUserDisabled}
            onToggleAdminDisabled={HandleToggleAdminDisabled}
            onUserApproval={HandleToggleUserDisabled}
            onAdminApproval={handleAdminApproval}
            onDeleteUser={deleteUser}
          />
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <SystemAdminsTab
            admins={admins}
            onViewDetails={setSelectedAdmin}
            onToggleAdminDisabled={HandleToggleAdminDisabled}
            onAdminApproval={handleAdminApproval}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <QuickActionsFooter
        users={users}
        admins={admins}
        pendingUsersCount={pendingUsers.length}
      />

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={open => { if (!open) setSelectedUser(null); }}
          approvalRemarks={approvalRemarks}
          onToggleUserDisabled={HandleToggleUserDisabled}
          setApprovalRemarks={setApprovalRemarks}
          handleAdminFinalApproval={handleAdminFinalApproval} 
          getStatusBadge={getStatusBadge}
        />
      )}

      {selectedAdmin && (
        <AdminDetailsModal
          admin={selectedAdmin}
          open={!!selectedAdmin}
          onOpenChange={open => { if (!open) setSelectedAdmin(null); }}
          handleAdminApproval={handleAdminApproval}
          onToggleAdminDisabled={HandleToggleAdminDisabled}
          approvalRemarks={approvalRemarks}
          setApprovalRemarks={setApprovalRemarks}
        />
      )}
    </div>
  );
};

export default AdminDashboard;