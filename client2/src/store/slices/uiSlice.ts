import { StateCreator } from 'zustand';
import { StoreState } from '../../types/store';

// Define types for the UI slice
interface UIState {
    menuOf: any[];
    selectionBox: any | null;
    loading: boolean;
    undoStack: any[];
    redoStack: any[];
}

interface UIActions {
    setMenuOf: (menu: any[]) => void;
    setSelectionBox: (box: any | null) => void;
    setLoading: (loading: boolean) => void;
    setUndoStack: (undoStack: any[]) => void;
    setRedoStack: (redoStack: any[]) => void;
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