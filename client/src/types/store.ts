import { DesignSlice } from '../store/slices/designSlice';
import { FileSlice } from '../store/slices/fileSlice';
import { RecentDesignSlice } from '../store/slices/recentDesignSlice';
import { UISlice } from '../store/slices/uiSlice';
import { UserSlice } from '../store/slices/userSlice';

// Additional types for the store
interface StoreActions {
    fetchProject: (id: string) => Promise<void>;
    generateStructure: (params?: {
        updatedAttributes?: Record<string, any> | null;
        updatedBaseDrawing?: string | null;
        updatedCategory?: string | null;
        updatedPages?: Record<string, any> | null;
    }) => any;
    toggleAttributeValue: (key: string) => void;
    updateSelectedOption: (attribute: string, option: string) => void;
    updateSelectedSubOption: (attribute: string, option: string, subOption: string) => void;
    pushToUndoStack: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    checkFileExists: (page: string, fileName: string) => boolean;
}

// Combined store state type
export type StoreState = DesignSlice & FileSlice & RecentDesignSlice & UISlice & UserSlice & StoreActions;