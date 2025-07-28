import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== 'all' && value !== ''
  ).length;

  const handleClearSearch = () => {
    setFilters({ search: '' });
  };

  return (
    <div className="bg-zinc-50/50 rounded-t-lg mb-4">
      {/* Primary filter row - always visible */}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name, email, ID, or mobile number..."
              className="pl-10 pr-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={filters.search}
              onChange={e => setFilters({ search: e.target.value })}
            />
            {filters.search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Status Filter */}
          <Select value={filters.approvalStatus} onValueChange={value => setFilters({ approvalStatus: value })}>
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Overall Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">✅ Approved</SelectItem>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="rejected">❌ Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-10 px-3 border-gray-300 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters - collapsible */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Department Filter */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <Select value={filters.department} onValueChange={value => setFilters({ department: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dep => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Designation Filter */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Designation</label>
              <Select value={filters.designation} onValueChange={value => setFilters({ designation: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Designations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {designations.map(des => (
                    <SelectItem key={des} value={des}>{des}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select value={filters.role} onValueChange={value => setFilters({ role: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Date Range</label>
              <Select value={filters.dateRange} onValueChange={value => setFilters({ dateRange: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DH Approval Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">DH Approval</label>
              <Select value={filters.dhApprovalStatus} onValueChange={value => setFilters({ dhApprovalStatus: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {approvalStatuses.map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Admin Approval Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Admin Approval</label>
              <Select value={filters.adminApprovalStatus} onValueChange={value => setFilters({ adminApprovalStatus: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {approvalStatuses.map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Account Status</label>
              <Select value={filters.isDisabled} onValueChange={value => setFilters({ isDisabled: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="enabled">🟢 Active</SelectItem>
                  <SelectItem value="disabled">🔴 Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Actions */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {activeFiltersCount > 0 ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied` : 'No filters applied'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-gray-600"
              >
                Collapse
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetFilters}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};