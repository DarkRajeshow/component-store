import React from 'react';
import { Button } from "@/components/ui/button";

interface Filters {
  search: string;
  department: string;
  designation: string;
  role: string;
  dhApprovalStatus: string;
  adminApprovalStatus: string;
  approvalStatus: string;
  dateRange: string;
  isDisabled: string;
}

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  departments: string[];
  designations: string[];
  roles: string[];
  approvalStatuses: string[];
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  departments,
  designations,
  roles,
  approvalStatuses,
  onResetFilters
}) => {
  return (
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
      <select
        className="border rounded px-2 py-1 text-sm"
        value={filters.isDisabled}
        onChange={e => setFilters(f => ({ ...f, isDisabled: e.target.value }))}
      >
        <option value="">All Statuses</option>
        <option value="enabled">Enabled</option>
        <option value="disabled">Disabled</option>
      </select>
      <Button variant="outline" size="sm" onClick={onResetFilters}>Reset</Button>
    </div>
  );
};