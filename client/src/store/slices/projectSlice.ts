// Import types
import { StateCreator } from 'zustand';
import { StoreState } from '../../../../deprecated/client/types/store.types';
import { IProject } from '@/types/project.types';

// Define types for the project slice
interface ProjectState {
    project: IProject | null;
    selectedCategory: string;
}

interface ProjectActions {
    setProject: (project: IProject) => void;
    setSelectedCategory: (category: string) => void;
}

export type ProjectSlice = ProjectState & ProjectActions;

// Slice for project states and functions
const createProjectSlice: StateCreator<StoreState, [], [], ProjectSlice> = (set) => ({
    project: {} as IProject,
    selectedCategory: '',
    // updatedValue: { value: {}, version: 0 },


    // Set project components
    setProject: (project) => set({ project }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),

});

export default createProjectSlice;