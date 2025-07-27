import { create } from 'zustand';
import { ComponentFilterParams } from '../types';

interface ComponentStoreState extends ComponentFilterParams {
  search: string;
  setFilter: (filter: Partial<ComponentFilterParams>) => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

const initialState: ComponentFilterParams = {
  componentCode: '',
  description: '',
  createdBy: '',
  issueNumber: '',
  latestRevisionNumber: '',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useComponentStore = create<ComponentStoreState>((set) => ({
  ...initialState,
  search: '',
  setFilter: (filter) => set((state) => ({ ...state, ...filter })),
  setSearch: (search) => set((state) => ({ 
    ...state, 
    search,
    componentCode: '', // Clear individual filters when using search
    description: '',   // Clear individual filters when using search
    page: 1 
  })),
  reset: () => set({ ...initialState, search: '' }),
})); 