// hooks/useSearchAndFilter.ts
import { useState, useMemo, useCallback } from 'react';
import { IDesign } from '@/types/design.types';
import { IProject } from '@/types/project.types';
import { FilterOption, SearchFilters } from '../types/home.types';

export const useSearchAndFilter = (
    designs: IDesign[] = [],
    projects: IProject[] = []
) => {
    const [filters, setFilters] = useState<SearchFilters>({
        searchQuery: '',
        type: 'all',
        category: '',
        dateRange: 'all',
        sortBy: 'date',
        sortOrder: 'desc'
    });

    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Extract unique categories for filter options
    const categories = useMemo((): FilterOption[] => {
        const designCategories = designs.map(d => d.category).filter(Boolean);
        const projectCategories = projects.flatMap(p =>
            Object.keys(p.hierarchy?.categoryMapping || {})
        );

        const allCategories = [...new Set([...designCategories, ...projectCategories])];

        return [
            { label: 'All Categories', value: '' },
            ...allCategories.map(cat => ({
                label: cat,
                value: cat,
                count: [...designs.filter(d => d.category === cat), ...projects.filter(p =>
                    Object.keys(p.hierarchy?.categoryMapping || {}).includes(cat)
                )].length
            }))
        ];
    }, [designs, projects]);

    // Filter and search logic
    const filteredItems = useMemo(() => {
        let allItems: (IDesign | IProject)[] = [];

        // Combine and filter by type
        if (filters.type === 'all' || filters.type === 'design') {
            allItems.push(...designs);
        }
        if (filters.type === 'all' || filters.type === 'project') {
            allItems.push(...projects);
        }

        // Apply search query
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            allItems = allItems.filter(item => {
                const searchFields = [
                    item.name,
                    item.description || '',
                    'structure' in item ? item.category : '',
                    'code' in item ? item.code : ''
                ].join(' ').toLowerCase();

                return searchFields.includes(query);
            });
        }

        // Apply category filter
        if (filters.category) {
            allItems = allItems.filter(item => {
                if ('structure' in item) {
                    return (item as IDesign).category === filters.category;
                } else {
                    return Object.keys((item as IProject).hierarchy?.categoryMapping || {})
                        .includes(filters.category);
                }
            });
        }

        // Apply date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            allItems = allItems.filter(item =>
                new Date(item.updatedAt) >= filterDate
            );
        }

        // Apply sorting
        allItems.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'name': {
                    comparison = a.name.localeCompare(b.name);
                    break;
                }
                case 'date': {
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                }
                case 'type': {
                    const aType = 'structure' in a ? 'design' : 'project';
                    const bType = 'structure' in b ? 'design' : 'project';
                    comparison = aType.localeCompare(bType);
                    break;
                }
                case 'category': {
                    const aCategory = 'structure' in a ? (a as IDesign).category : 'project';
                    const bCategory = 'structure' in b ? (b as IDesign).category : 'project';
                    comparison = aCategory.localeCompare(bCategory);
                    break;
                }
            }

            return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return allItems;
    }, [designs, projects, filters]);

    const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            searchQuery: '',
            type: 'all',
            category: '',
            dateRange: 'all',
            sortBy: 'date',
            sortOrder: 'desc'
        });
    }, []);

    const toggleFilterPanel = useCallback(() => {
        setShowFilterPanel(prev => !prev);
    }, []);

    return {
        filters,
        filteredItems,
        categories,
        showFilterPanel,
        updateFilters,
        resetFilters,
        toggleFilterPanel,
        totalCount: filteredItems.length,
        originalCount: designs.length + projects.length
    };
};