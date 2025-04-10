// Import types
import { StateCreator } from 'zustand';
import { StoreState } from '../../../../deprecated/client/types/store.types';
import { IDesign, IFileInfo } from '@/types/design.types';
import { IComponents, IPages } from '@/types/project.types';

// Define types for the Editor slice
interface EditorState {
    components: IComponents;
    baseDrawing: IFileInfo | null;
    updatedComponents: IComponents;
    pages: IPages | null;
    selectedPage: string;
    rotation: number;
}

interface EditorActions {
    setComponents: (components: IComponents) => void;
    setUpdatedComponents: (components: IComponents) => void;
    setBaseDrawing: (drawing: IFileInfo) => void;
    setPages: (updatedPages: IPages) => void;
    setSelectedPage: (page: string) => void;
    setRotation: (updatedRotation: number) => void;
}

export type EditorSlice = EditorState & EditorActions;

// Slice for Editor states and functions
const createEditorSlice: StateCreator<StoreState, [], [], EditorSlice> = (set) => ({
    Editor: {} as IDesign,
    components: {} as IComponents,
    baseDrawing: {} as IFileInfo,
    updatedComponents: {} as IComponents,
    pages: {} as IPages,
    selectedPage: 'gad',
    rotation: 0,
    // updatedValue: { value: {}, version: 0 },


    // Set Editor components
    setComponents: (components) => set({ components: components }),
    setBaseDrawing: (drawing) => set({ baseDrawing: drawing }),
    setUpdatedComponents: (components) => set({ updatedComponents: components }),
    setPages: (updatedPages) => set({ pages: updatedPages }),
    setSelectedPage: (page) => set({ selectedPage: page }),
    setRotation: (updatedRotation) => set({ rotation: updatedRotation })

    // setUpdatedValue: (newValue) =>
    //     set((state) => ({ updatedValue: { value: newValue, version: state.updatedValue.version + 1 } })),
});

export default createEditorSlice;