// Import types
import { StateCreator } from 'zustand';
import { StoreState } from '../../../../deprecated/client/types/store.types';
import { IDesign, IFileInfo, IStructure } from '@/types/design.types';
import { IComponents, IPages, IProject } from '@/types/project.types';

// Define types for the Editor slice
interface EditorState {
    content: IDesign | IProject | null;
    components: IComponents;
    baseDrawing: IFileInfo | null;
    updatedComponents: IComponents;
    componentSelections: IComponents,
    pages: IPages | null;
    selectedPage: string;
    rotation: number;
    structure: IStructure
}

interface EditorActions {
    setContent: (content: IDesign | IProject | null) => void;
    setComponents: (components: IComponents) => void;
    setUpdatedComponents: (components: IComponents) => void;
    setComponentSelections: (components: IComponents) => void;
    setBaseDrawing: (drawing: IFileInfo) => void;
    setPages: (updatedPages: IPages) => void;
    setSelectedPage: (page: string) => void;
    setRotation: (updatedRotation: number) => void;
    setStructure: (updatedStructure: IStructure) => void;
}

export type EditorSlice = EditorState & EditorActions;

// Slice for Editor states and functions
const createEditorSlice: StateCreator<StoreState, [], [], EditorSlice> = (set) => ({
    content: null,
    Editor: {} as IDesign,
    components: {} as IComponents,
    baseDrawing: {} as IFileInfo,
    updatedComponents: {} as IComponents,
    componentSelections: {} as IComponents,
    pages: {} as IPages,
    selectedPage: '',
    rotation: 0,
    structure: {} as IStructure,
    // updatedValue: { value: {}, version: 0 },


    // Set Editor components
    setContent: (content) => set({ content: content }),
    setComponents: (components) => set({ components: components }),
    setBaseDrawing: (drawing) => set({ baseDrawing: drawing }),
    setUpdatedComponents: (components) => set({ updatedComponents: components }),
    setComponentSelections: (components) => set({ componentSelections: components }),
    setPages: (updatedPages) => set({ pages: updatedPages }),
    setSelectedPage: (page) => set({ selectedPage: page }),
    setRotation: (updatedRotation) => set({ rotation: updatedRotation }),
    setStructure: (updatedStructure) => set({ structure: updatedStructure })

    // setUpdatedValue: (newValue) =>
    //     set((state) => ({ updatedValue: { value: newValue, version: state.updatedValue.version + 1 } })),
});

export default createEditorSlice;