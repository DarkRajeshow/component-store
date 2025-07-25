import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Eye, Users, Shield, Mail, User, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';
import AdminDetailsModal from './AdminDetailsModal';
import { ApprovalStatus, IAdmin, IUser } from '@/types/user.types';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';

// const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

interface Filters {
  search: string;
  department: string;
  designation: string;
  role: string;
  dhApprovalStatus: string;
  adminApprovalStatus: string;
  approvalStatus: string;
  dateRange: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [admins, setAdmins] = useState<IAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<IAdmin | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    department: '',
    designation: '',
    role: '',
    dhApprovalStatus: '',
    adminApprovalStatus: '',
    approvalStatus: '',
    dateRange: ''
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
      const [usersRes, adminsRes] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllAdmins(),
      ]);
      setUsers(usersRes.users || []);
      setAdmins(adminsRes.admins || []);
      // Debug: log all users and their approval statuses
      console.log('Fetched users:', usersRes.users);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserApproval = async (userId: string, isApproved: boolean) => {
    try {
      await adminService.approveUser(userId, isApproved);
      setUsers(users => users.map(u => u._id === userId ? { ...u, isApproved } : u));
    } catch (err) {
      setError('Failed to update user app roval');
      console.error(err);
    }
  };

  const handleAdminFinalApproval = async (userId: string, action: "approve" | "reject", remarks?: string) => {
    try {
      await adminService.adminApprovalForUser(userId, action, remarks);
      setUsers(users => users.map(u =>
        u._id === userId
          ? {
            ...u,
            adminApprovalStatus: action === "approve" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
            isApproved: action === "approve"
          }
          : u
      ));
      setApprovalRemarks('');
      setSelectedUser(null);
    } catch (err: any) {
      let errorMsg = 'Failed to update admin approval';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const handleAdminApproval = async (adminId: string, action: "approve" | "reject", remarks?: string) => {
    try {
      await adminService.adminApprovalForAdmin(adminId, action, remarks);
      setAdmins(admins => admins.map(a => a._id === adminId ? { ...a, isApproved: action === "approve" } : a));
      setSelectedAdmin(null);
      toast.success(`Admin ${action}d successfully`);
    } catch (err: any) {
      let errorMsg = 'Failed to update admin approval';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    }
  };

  // const handleAdminSystem = async (adminId: string, isSystemAdmin: boolean) => {
  //   try {
  //     await adminService.approveAdmin(adminId, isSystemAdmin);
  //     setAdmins(admins => admins.map(a => a._id === adminId ? { ...a, isSystemAdmin } : a));
  //   } catch (err) {
  //     setError('Failed to update admin status');
  //     console.error(err);
  //   }
  // };

  const filteredUsers = useMemo(() => {
    // Combine users and admins for display in All Users tab
    const allUsers = [
      ...users,
      ...admins.map(admin => ({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        employeeId: '-',
        mobileNo: '-',
        department: '-',
        designation: '-',
        role: admin.role,
        dhApprovalStatus: '-',
        adminApprovalStatus: '-',
        isApproved: '-',
        createdAt: admin.createdAt,
        isSystemUser: true,
      }))
    ];
    return allUsers.filter(user => {
      const matchesSearch = !filters.search ||
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(filters.search.toLowerCase())) ||
        (user.mobileNo && user.mobileNo.includes(filters.search));

      const matchesDepartment = !filters.department || user.department === filters.department;
      const matchesDesignation = !filters.designation || user.designation === filters.designation;
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesDhApproval = !filters.dhApprovalStatus || user.dhApprovalStatus === filters.dhApprovalStatus;
      const matchesAdminApproval = !filters.adminApprovalStatus || user.adminApprovalStatus === filters.adminApprovalStatus;

      const matchesApprovalStatus = !filters.approvalStatus ||
        (filters.approvalStatus === 'approved' && user.isApproved) ||
        (filters.approvalStatus === 'pending' && !user.isApproved) ||
        (filters.approvalStatus === 'rejected' && user.adminApprovalStatus === 'rejected');

      const matchesDateRange = !filters.dateRange || (() => {
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

      return matchesSearch && matchesDepartment && matchesDesignation &&
        matchesRole && matchesDhApproval && matchesAdminApproval &&
        matchesApprovalStatus && matchesDateRange;
    });
  }, [users, admins, filters]);

  const pendingUsers = [
    ...users.filter(u =>
      u.dhApprovalStatus?.toLowerCase() === "approved" &&
      u.adminApprovalStatus?.toLowerCase() === "pending"
    ),
    ...admins.filter(a => a.isApproved === null)
  ];

  // Debug: log pendingUsers after calculation
  console.log('pendingUsers:', pendingUsers);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'not_required':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><AlertTriangle className="w-3 h-3 mr-1" />Not Required</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      department: '',
      designation: '',
      role: '',
      dhApprovalStatus: '',
      adminApprovalStatus: '',
      approvalStatus: '',
      dateRange: ''
    });
  };

  // User Details Modal (pure content, no Dialog wrapper)
  // Removed unused UserDetailsModalContent, using external UserDetailsModal only

  // Filter/Search Bar UI
  const renderUserFilters = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <input
        type="text"
        placeholder="Search by name, email, ID, or mobile"
        className="border rounded px-2 py-1 text-sm"
        value={filters.search}
        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        style={{ minWidth: 200 }}
      />
      <select
        className="border rounded px-2 py-1 text-sm"
        value={filters.department}
        onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
      >
        <option value="">All Departments</option>
        {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
      </select>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={filters.designation}
        onChange={e => setFilters(f => ({ ...f, designation: e.target.value }))}
      >
        <option value="">All Designations</option>
        {designations.map(des => <option key={des} value={des}>{des}</option>)}
      </select>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={filters.role}
        onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
      >
        <option value="">All Roles</option>
        {roles.map(role => <option key={role} value={role}>{role}</option>)}
      </select>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={filters.dhApprovalStatus}
        onChange={e => setFilters(f => ({ ...f, dhApprovalStatus: e.target.value }))}
      >
        <option value="">DH Approval</option>
        {approvalStatuses.map(st => <option key={st} value={st}>{st}</option>)}
      </select>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={filters.adminApprovalStatus}
        onChange={e => setFilters(f => ({ ...f, adminApprovalStatus: e.target.value }))}
      >
        <option value="">Admin Approval</option>
        {approvalStatuses.map(st => <option key={st} value={st}>{st}</option>)}
      </select>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={filters.approvalStatus}
        onChange={e => setFilters(f => ({ ...f, approvalStatus: e.target.value }))}
      >
        <option value="">Overall Status</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
      </select>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={filters.dateRange}
        onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}
      >
        <option value="">All Dates</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
      <Button variant="outline" size="sm" onClick={resetFilters}>Reset</Button>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-lg">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, approvals, and system administrators</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingUsers.length}</p>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.isApproved).length}</p>
                <p className="text-sm text-gray-600">Approved Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{admins.length}</p>
                <p className="text-sm text-gray-600">System Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Approvals ({pendingUsers.length})</TabsTrigger>
          <TabsTrigger value="users">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="admins">System Admins ({admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Users & Admins Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No pending approvals</p>
                  <p>All users and admins have been processed</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name / Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Department / Role</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map(item => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.role === 'admin' ? 'Admin' : 'User'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.role === 'admin' ? item.role : item.department}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" tabIndex={0} onClick={() => {
                              if (item.role === 'admin') {
                                setSelectedAdmin(item);
                              } else {
                                setSelectedUser(item);
                              }
                            }}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            {item.role === 'admin' ? (
                              <Switch
                                checked={!!item.isApproved}
                                onCheckedChange={checked => handleAdminApproval(item._id, checked ? "approve" : "reject")}
                              />
                            ) : (
                              <Switch
                                checked={!!item.isApproved}
                                onCheckedChange={checked => handleUserApproval(item._id, checked)}
                                disabled={item.adminApprovalStatus === 'rejected'}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderUserFilters()}
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No users found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Details</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.employeeId || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.department || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.designation || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" tabIndex={0} onClick={() => {
                              if ((user).role === 'admin') {
                                setSelectedAdmin(user);
                              } else {
                                setSelectedUser(user);
                              }
                            }}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            {user.role === 'admin' && user.isApproved !== true && (
                              <Switch
                                checked={!!user.isApproved}
                                onCheckedChange={checked => handleAdminApproval(user._id, checked ? "approve" : "reject")}
                              />
                            )}
                            {!(user.role === 'admin') && (
                              <Switch
                                checked={!!user.isApproved}
                                onCheckedChange={checked => handleUserApproval(user._id, checked)}
                                disabled={user.adminApprovalStatus === 'rejected'}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                System Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>System Admin Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map(admin => (
                    <TableRow key={admin._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {admin.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {admin.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center gap-2">
                          <span className={admin.isSystemAdmin ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {admin.isSystemAdmin ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Shield className="w-3 h-3 mr-1" />
                                System Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Regular Admin
                              </Badge>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                     <div className='flex items-center gap-4 justify-center'>
                         <Button onClick={() => {
                          setSelectedAdmin(admin);
                        }} variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>

                        {admin.isApproved !== true && (
                          <Switch
                            checked={!!admin.isApproved}
                            onCheckedChange={checked => handleAdminApproval(admin._id, checked ? "approve" : "reject")}
                          />
                        )}
                     </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Admin Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => {/* logic to add new admin */ }}>
                  <Users className="w-4 h-4 mr-2" />
                  Add New Admin
                </Button>
                {/* Remove Bulk Admin Actions and Admin Activity Log buttons if not functional */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                Total Users: {users.length + admins.length}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Pending: {pendingUsers.length}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Approved: {users.filter(u => u.isApproved).length}
              </Badge>
            </div>
            <div className="flex gap-2">
              {/* Remove Export Users, Generate Report, Bulk Actions if not functional */}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={open => { if (!open) setSelectedUser(null); }}
          approvalRemarks={approvalRemarks}
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
          approvalRemarks={approvalRemarks}
          setApprovalRemarks={setApprovalRemarks}
        />
      )}
    </div>
  );
};

export default AdminDashboard;