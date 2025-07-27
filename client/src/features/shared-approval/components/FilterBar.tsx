import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApprovalFilters } from '../types';

interface FilterBarProps {
  filters: ApprovalFilters;
  setFilters: (filters: Partial<ApprovalFilters>) => void;
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
    <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
      <Input
        type="text"
        placeholder="Search by name, email, ID, or mobile"
        className="min-w-[200px]"
        value={filters.search}
        onChange={e => setFilters({ search: e.target.value })}
      />
      
      <Select value={filters.department} onValueChange={value => setFilters({ department: value })}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.designation} onValueChange={value => setFilters({ designation: value })}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="All Designations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Designations</SelectItem>
          {designations.map(des => <SelectItem key={des} value={des}>{des}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.role} onValueChange={value => setFilters({ role: value })}>
        <SelectTrigger className="min-w-[120px]">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.dhApprovalStatus} onValueChange={value => setFilters({ dhApprovalStatus: value })}>
        <SelectTrigger className="min-w-[130px]">
          <SelectValue placeholder="DH Approval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">DH Approval</SelectItem>
          {approvalStatuses.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.adminApprovalStatus} onValueChange={value => setFilters({ adminApprovalStatus: value })}>
        <SelectTrigger className="min-w-[130px]">
          <SelectValue placeholder="Admin Approval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Admin Approval</SelectItem>
          {approvalStatuses.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.approvalStatus} onValueChange={value => setFilters({ approvalStatus: value })}>
        <SelectTrigger className="min-w-[130px]">
          <SelectValue placeholder="Overall Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Overall Status</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.dateRange} onValueChange={value => setFilters({ dateRange: value })}>
        <SelectTrigger className="min-w-[120px]">
          <SelectValue placeholder="All Dates" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Dates</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.isDisabled} onValueChange={value => setFilters({ isDisabled: value })}>
        <SelectTrigger className="min-w-[120px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="enabled">Enabled</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={onResetFilters}>
        Reset Filters
      </Button>
    </div>
  );
}; 