import { ProjectSlice } from '@/store/slices/projectSlice';
import { DesignSlice } from '../../../client/src/store/slices/designSlice';
import { FileSlice } from '../../../client/src/store/slices/fileSlice';
import { RecentDesignSlice } from '../../../client/src/store/slices/recentDesignSlice';
import { UISlice } from '../../../client/src/store/slices/uiSlice';
import { UserSlice } from '../../../client/src/store/slices/userSlice';
import { EditorSlice } from '@/store/slices/editorSlice';

// Additional types for the store
interface StoreActions {
    fetchProject: (id: string) => Promise<void>;
    generateStructure: (params?: {
        updatedComponents?: Record<string, any> | null;
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
export type StoreState = DesignSlice & ProjectSlice & EditorSlice & FileSlice & RecentDesignSlice & UISlice & UserSlice & StoreActions;