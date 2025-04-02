// Import types
import { StateCreator } from 'zustand';
import { StoreState } from '../../types/store';
import { IDesign } from '@/types/types';

// Define types for the design slice
interface DesignState {
    design: IDesign | null;
    designAttributes: Record<string, any>;
    selectedCategory: string;
    baseDrawing: string;
    updatedAttributes: Record<string, any>;
    pages: Record<string, any>;
    selectedPage: string;
    rotation: number;
}

interface DesignActions {
    setDesign: (design: IDesign) => void;
    setDesignAttributes: (attributes: Record<string, any>) => void;
    setSelectedCategory: (category: string) => void;
    setBaseDrawing: (drawing: string) => void;
    setUpdatedAttributes: (attributes: Record<string, any>) => void;
    setPages: (updatedPages: Record<string, any>) => void;
    setSelectedPage: (page: string) => void;
    setRotation: (updatedRotation: number) => void;
}

export type DesignSlice = DesignState & DesignActions;

// Slice for design states and functions
const createDesignSlice: StateCreator<StoreState, [], [], DesignSlice> = (set) => ({
    design: {} as IDesign,
    designAttributes: {},
    selectedCategory: '',
    baseDrawing: '',
    updatedAttributes: {},
    pages: {},
    selectedPage: 'gad',
    rotation: 0,
    // updatedValue: { value: {}, version: 0 },

    setDesign: (design) => set({ design }),

    // Set design attributes
    setDesignAttributes: (attributes) => set({ designAttributes: attributes }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setBaseDrawing: (drawing) => set({ baseDrawing: drawing }),
    setUpdatedAttributes: (attributes) => set({ updatedAttributes: attributes }),
    setPages: (updatedPages) => set({ pages: updatedPages }),
    setSelectedPage: (page) => set({ selectedPage: page }),
    setRotation: (updatedRotation) => set({ rotation: updatedRotation })

    // setUpdatedValue: (newValue) =>
    //     set((state) => ({ updatedValue: { value: newValue, version: state.updatedValue.version + 1 } })),
});

export default createDesignSlice;