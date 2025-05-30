// types/enhanced-home.types.ts
export interface SearchFilters {
    searchQuery: string;
    type: 'all' | 'design' | 'project';
    category: string;
    dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
    sortBy: 'name' | 'date' | 'type' | 'category';
    sortOrder: 'asc' | 'desc';
}

export interface ViewMode {
    layout: 'grid' | 'list';
    itemsPerRow: 2 | 3 | 4;
}

export interface CardViewState {
    selectedPage: string;
    isHovering: boolean;
    isPreviewMode: boolean;
}

export interface HomePageState {
    filters: SearchFilters;
    viewMode: ViewMode;
    isLoading: boolean;
    selectedItems: string[];
    showFilterPanel: boolean;
}

export interface ItemCardProps<T> {
    item: T;
    onSelect?: (id: string) => void;
    isSelected?: boolean;
    viewMode: ViewMode;
    onPageChange?: (pageId: string) => void;
}

export interface FilterOption {
    label: string;
    value: string;
    count?: number;
}

export interface SearchAndFilterProps {
    filters: SearchFilters;
    onFiltersChange: (filters: Partial<SearchFilters>) => void;
    categories: FilterOption[];
    totalCount: number;
    showFilterPanel: boolean;
    onToggleFilterPanel: () => void;
}