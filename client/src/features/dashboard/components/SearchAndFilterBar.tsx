import React from 'react';
import { Search, Filter, Grid, List, SortAsc, SortDesc, X, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SearchFilters, FilterOption, ViewMode } from '../types/home.types';

interface SearchAndFilterBarProps {
    filters: SearchFilters;
    onFiltersChange: (filters: Partial<SearchFilters>) => void;
    categories: FilterOption[];
    totalCount: number;
    originalCount: number;
    showFilterPanel: boolean;
    onToggleFilterPanel: () => void;
    viewMode: ViewMode;
    onViewModeChange: (viewMode: Partial<ViewMode>) => void;
    onResetFilters: () => void;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
    filters,
    onFiltersChange,
    categories,
    totalCount,
    originalCount,
    showFilterPanel,
    onToggleFilterPanel,
    viewMode,
    onViewModeChange,
    onResetFilters
}) => {
    const hasActiveFilters = filters.searchQuery || filters.type !== 'all' || filters.category || filters.dateRange !== 'all';

    return (
        <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
            {/* Main Search Bar */}
            <div className="px-6 py-4">
                <div className="flex items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search designs and projects..."
                            value={filters.searchQuery}
                            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
                            className="pl-10 pr-4 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {filters.searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                onClick={() => onFiltersChange({ searchQuery: '' })}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2">
                        <Select value={filters.type} onValueChange={(value) => onFiltersChange({ type: value as any })}>
                            <SelectTrigger className="w-32 h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="design">Designs</SelectItem>
                                <SelectItem value="project">Projects</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant={showFilterPanel ? "default" : "outline"}
                            size="sm"
                            onClick={onToggleFilterPanel}
                            className="h-10 px-3"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                                    Active
                                </Badge>
                            )}
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* View Controls */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-300 rounded-md p-1">
                            <Button
                                variant={viewMode.layout === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onViewModeChange({ layout: 'grid' })}
                                className="h-8 w-8 p-0"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode.layout === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onViewModeChange({ layout: 'list' })}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        {viewMode.layout === 'grid' && (
                            <Select
                                value={viewMode.itemsPerRow.toString()}
                                onValueChange={(value) => onViewModeChange({ itemsPerRow: parseInt(value) as any })}
                            >
                                <SelectTrigger className="w-16 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Results Count */}
                    <div className="text-sm text-gray-600 whitespace-nowrap">
                        {totalCount === originalCount ? (
                            <span>{totalCount} items</span>
                        ) : (
                            <span>{totalCount} of {originalCount} items</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilterPanel && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <Select value={filters.category} onValueChange={(value) => onFiltersChange({ category: value })}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{category.label}</span>
                                                {category.count !== undefined && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        {category.count}
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range Filter */}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <Select value={filters.dateRange} onValueChange={(value) => onFiltersChange({ dateRange: value as any })}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Controls */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Sort by:</span>
                            <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ sortBy: value as any })}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="type">Type</SelectItem>
                                    <SelectItem value="category">Category</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onFiltersChange({
                                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                                })}
                                className="h-9 w-9 p-0"
                            >
                                {filters.sortOrder === 'asc' ? (
                                    <SortAsc className="h-4 w-4" />
                                ) : (
                                    <SortDesc className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        <div className="flex-1" />

                        {/* Reset Filters */}
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={onResetFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Active Filters */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                            <span className="text-sm text-gray-500">Active filters:</span>
                            <div className="flex items-center gap-2 flex-wrap">
                                {filters.type !== 'all' && (
                                    <Badge variant="secondary" className="capitalize">
                                        {filters.type}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                                            onClick={() => onFiltersChange({ type: 'all' })}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}

                                {filters.category && (
                                    <Badge variant="secondary">
                                        {categories.find(c => c.value === filters.category)?.label}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                                            onClick={() => onFiltersChange({ category: '' })}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}

                                {filters.dateRange !== 'all' && (
                                    <Badge variant="secondary" className="capitalize">
                                        {filters.dateRange === 'today' ? 'Today' :
                                            filters.dateRange === 'week' ? 'This Week' :
                                                filters.dateRange === 'month' ? 'This Month' : 'This Year'}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                                            onClick={() => onFiltersChange({ dateRange: 'all' })}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};