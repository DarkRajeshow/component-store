import { StateCreator } from 'zustand';
import { StoreState } from '../../../../deprecated/client/types/store.types';
import { IComponents } from '@/types/project.types';
import { ISelectionBox } from '@/types/store.types';

// Define types for the UI slice
interface UIState {
    menuOf: string[];
    selectionBox: ISelectionBox | null;
    loading: boolean;
    undoStack: IComponents[];
    redoStack: IComponents[];
}

interface UIActions {
    setMenuOf: (menu: string[]) => void;
    setSelectionBox: (box: ISelectionBox | null) => void;
    setLoading: (loading: boolean) => void;
    setUndoStack: (undoStack: IComponents[]) => void;
    setRedoStack: (redoStack: IComponents[]) => void;
}

export type UISlice = UIState & UIActions;

// Slice for UI-related states and undo/redo stacks
const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
    menuOf: [],
    selectionBox: null,
    loading: true,
    undoStack: [],
    redoStack: [],

    setMenuOf: (menu) => set({ menuOf: menu }),
    setSelectionBox: (box) => set({ selectionBox: box }),
    setLoading: (loading) => set({ loading }),
    setUndoStack: (undoStack) => set({ undoStack }),
    setRedoStack: (redoStack) => set({ redoStack }),
});

export default createUISlice;