import { useEffect, useState, useRef } from 'react';
import { useComponentStore } from '../hooks/useComponentStore';
import { getComponents, deleteComponent } from '../services/api';
import { Component } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Eye,
  Plus,
  Search,
  Filter,
  X,
  Loader2,
  Calendar,
  Trash2
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { toast } from 'sonner';

export function ComponentTable({ onCreate }: { onCreate: () => void }) {
  const store = useComponentStore();
  const [data, setData] = useState<Component[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDesigner = user?.role === 'designer' || user?.role === 'admin';
  const [deletingComponentId, setDeletingComponentId] = useState<string | null>(null);
  const [componentToDelete, setComponentToDelete] = useState<{ id: string; name: string } | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Store state:', store);
      
      // Construct parameters for API call
      const params: Record<string, any> = {
        page: store.page,
        limit: store.limit,
        sortBy: store.sortBy,
        sortOrder: store.sortOrder,
      };

      // If search is active, use search parameter, otherwise use individual filters
      if (store.search) {
        params.search = store.search;
      } else {
        if (store.componentCode) params.componentCode = store.componentCode;
        if (store.description) params.description = store.description;
      }

      // Add other filters
      if (store.createdBy) params.createdBy = store.createdBy;
      if (store.issueNumber) params.issueNumber = store.issueNumber;
      if (store.latestRevisionNumber) params.latestRevisionNumber = store.latestRevisionNumber;
      if (store.startDate) params.startDate = store.startDate;
      if (store.endDate) params.endDate = store.endDate;

      console.log('API Parameters:', params);
      const res = await getComponents(params);
      console.log('API Response:', res);
      setData(res.components || []);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch components:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [store.page, store.limit, store.sortBy, store.sortOrder]);

  // Debounced search
  const debouncedFetch = debounce(fetchData, 400);
  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
    // eslint-disable-next-line
  }, [store.search, store.componentCode, store.description, store.createdBy, store.issueNumber, store.latestRevisionNumber, store.startDate, store.endDate]);

  // Restore focus after data updates
  useEffect(() => {
    if (searchFocused && searchInputRef.current && !loading) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          // Restore cursor position to end of input
          const length = searchInputRef.current.value.length;
          searchInputRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }
  }, [loading, searchFocused]);

  const handleSort = (field: string) => {
    if (store.sortBy === field) {
      store.setFilter({ sortOrder: store.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      store.setFilter({ sortBy: field, sortOrder: 'asc' });
    }
  };

  const resetFilters = () => {
    store.reset();
  };

  const getSortIcon = (field: string) => {
    if (store.sortBy !== field) return null;
    return store.sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const handleDeleteComponent = async (componentId: string, componentName: string) => {
    setComponentToDelete({ id: componentId, name: componentName });
  };

  const confirmDelete = async () => {
    if (!componentToDelete) return;

    setDeletingComponentId(componentToDelete.id);
    try {
      await deleteComponent(componentToDelete.id);
      toast.success('Component deleted successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete component:', error);
      toast.error('Failed to delete component');
    } finally {
      setDeletingComponentId(null);
      setComponentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Component Models</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and search component designs</p>
        </div>
        {
          isDesigner && (
            <Button onClick={onCreate} className="gap-2">
              <Plus size={18} />
              Create Component
            </Button>
          )
        }
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-card dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <Input
              ref={searchInputRef}
              placeholder="Search by component code, name, or description..."
              value={store.search}
              onChange={e => {
                const value = e.target.value;
                store.setSearch(value);
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-10 bg-background dark:bg-zinc-900 text-foreground dark:text-white"
              disabled={loading}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400 dark:text-gray-500" size={16} />
            )}
            {store.search && !loading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => store.setSearch('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X size={14} />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter size={16} />
            Filters
            {showFilters && <Badge variant="secondary" className="ml-1">Active</Badge>}
          </Button>
          {(store.search || store.componentCode || store.description || store.createdBy || store.issueNumber || store.latestRevisionNumber || store.startDate || store.endDate) && (
            <Badge variant="outline" className="text-xs">
              Search Active
            </Badge>
          )}
          <Button variant="ghost" onClick={resetFilters} className="gap-2">
            <X size={16} />
            Clear
          </Button>
        </div>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Component Code</label>
              <Input
                placeholder="e.g., ABC123"
                value={store.componentCode}
                onChange={e => store.setFilter({ componentCode: e.target.value, page: 1 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Issue Number</label>
              <Input
                placeholder="e.g., 001"
                value={store.issueNumber}
                onChange={e => store.setFilter({ issueNumber: e.target.value, page: 1 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Latest Revision</label>
              <Input
                placeholder="e.g., 00"
                value={store.latestRevisionNumber}
                onChange={e => store.setFilter({ latestRevisionNumber: e.target.value, page: 1 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Created By</label>
              <Input
                placeholder="Search by creator"
                value={store.createdBy}
                onChange={e => store.setFilter({ createdBy: e.target.value, page: 1 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="date"
                  value={store.startDate}
                  onChange={e => store.setFilter({ startDate: e.target.value, page: 1 })}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target && target.showPicker) {
                      target.showPicker();
                    }
                  }}
                  className="pl-10 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="date"
                  value={store.endDate}
                  onChange={e => store.setFilter({ endDate: e.target.value, page: 1 })}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target && target.showPicker) {
                      target.showPicker();
                    }
                  }}
                  className="pl-10 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select
                value={store.sortBy}
                onValueChange={(value) => store.setFilter({ sortBy: value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className=''>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="componentCode">Component Code</SelectItem>
                  <SelectItem value="issueNumber">Issue Number</SelectItem>
                  <SelectItem value="latestRevisionNumber">Latest Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Order</label>
              <Select
                value={store.sortOrder}
                onValueChange={(value: 'asc' | 'desc') => store.setFilter({ sortOrder: value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${data.length} component${data.length !== 1 ? 's' : ''} found`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select
            value={(store.limit || 10).toString()}
            onValueChange={(value) => store.setFilter({ limit: parseInt(value), page: 1 })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto pl-6 pr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort('componentCode')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1">
                    Code
                    {getSortIcon('componentCode')}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('name')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead
                  onClick={() => handleSort('issueNumber')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1">
                    Issue #
                    {getSortIcon('issueNumber')}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('latestRevisionNumber')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1">
                    Latest Rev
                    {getSortIcon('latestRevisionNumber')}
                  </div>
                </TableHead>
                <TableHead>Created By</TableHead>
                <TableHead
                  onClick={() => handleSort('createdAt')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1">
                    Created At
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading components...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No components found</h3>
                      <p className="text-muted-foreground mb-4">
                        {store.componentCode || store.description || store.createdBy || store.issueNumber || store.latestRevisionNumber || store.startDate || store.endDate
                          ? 'Try adjusting your search criteria'
                          : 'Get started by creating your first component'
                        }
                      </p>
                      {!store.componentCode && !store.description && !store.createdBy && !store.issueNumber && !store.latestRevisionNumber && !store.startDate && !store.endDate && isDesigner && (
                        <Button onClick={onCreate} className="gap-2">
                          <Plus size={16} />
                          Create Component
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map(component => (
                  <TableRow key={component._id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/components/${component._id}`)}>
                    <TableCell className="font-medium">{component.componentCode}</TableCell>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={component.description}>
                      {component.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{component.issueNumber || 'Not set'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{component.latestRevisionNumber || 'Not set'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{component.createdBy?.name}</span>
                        <span className="text-xs text-muted-foreground">{component.createdBy?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{new Date(component.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">{new Date(component.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/components/${component._id}`);
                          }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Button>
                        {isDesigner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComponent(component._id, component.name);
                            }}
                            title="Delete Component"
                            disabled={deletingComponentId === component._id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {deletingComponentId === component._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Page {store.page || 1} of {totalPages} • {data.length} of {totalPages * (store.limit || 10)} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.setFilter({ page: Math.max(1, (store.page || 1) - 1) })}
              disabled={(store.page || 1) === 1 || loading}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={(store.page || 1) === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => store.setFilter({ page: pageNum })}
                    disabled={loading}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.setFilter({ page: Math.min(totalPages, (store.page || 1) + 1) })}
              disabled={(store.page || 1) === totalPages || loading}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!componentToDelete} onOpenChange={() => setComponentToDelete(null)}>
        <AlertDialogContent className='bg-background dark:bg-zinc-900'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Component</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete component "{componentToDelete?.name}"? 
              This action cannot be undone and will delete all associated revisions and files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={deletingComponentId === componentToDelete?.id}
            >
              {deletingComponentId === componentToDelete?.id ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Component'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 