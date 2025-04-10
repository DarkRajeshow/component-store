// Import types
import { StateCreator } from 'zustand';
import { StoreState } from '../../../../deprecated/client/types/store.types';
import { IDesign } from '@/types/design.types';

// Define types for the design slice
interface DesignState {
    design: IDesign | null;
    category: string;
}

interface DesignActions {
    setDesign: (design: IDesign) => void;
    setCategory: (updatedCategory: string) => void;
}

export type DesignSlice = DesignState & DesignActions;

// Slice for design states and functions
const createDesignSlice: StateCreator<StoreState, [], [], DesignSlice> = (set) => ({
    design: {} as IDesign,
    category: '',
    // updatedValue: { value: {}, version: 0 },


    // Set design components
    setDesign: (design) => set({ design }),
    setCategory: (updatedCategory) => set({ category: updatedCategory })

    // setUpdatedValue: (newValue) =>
    //     set((state) => ({ updatedValue: { value: newValue, version: state.updatedValue.version + 1 } })),
});

export default createDesignSlice;