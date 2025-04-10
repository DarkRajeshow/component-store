import { ProjectSlice } from '@/store/slices/projectSlice';
import { DesignSlice } from '@/store/slices/designSlice';  // Fixed relative path
import { FileSlice } from '@/store/slices/fileSlice';      // Fixed relative path
import { RecentDesignSlice } from '@/store/slices/recentDesignSlice'; // Fixed relative path 
import { UISlice } from '@/store/slices/uiSlice';          // Fixed relative path
import { UserSlice } from '@/store/slices/userSlice';      // Fixed relative path
import { EditorSlice } from '@/store/slices/editorSlice';
import { IComponents, IFileInfo, IPages } from './design.types';
import { IHierarchy } from './project.types';

// Additional types for the store
interface StoreActions {
    fetchProject: (id: string) => Promise<void>;
    fetchDesign: (id: string) => Promise<void>;
    generateHierarchy: (params?: {
        updatedComponents?: IComponents | null;
        updatedBaseDrawing?: IFileInfo | null;
        updatedCategory?: string | null;
        updatedPages?: IPages | null;
    }) => IHierarchy;
    toggleComponentValue: (key: string) => void;
    updateselected: (attribute: string, option: string) => void;
    updateSelectedSubOption: (attribute: string, option: string, subOption: string) => void;
    pushToUndoStack: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    checkFileExists: (page: string, fileName: string) => boolean;
}

// Combined store state type
export type StoreState = DesignSlice & ProjectSlice & EditorSlice & FileSlice & RecentDesignSlice & UISlice & UserSlice & StoreActions;


export interface ISelectionBox {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}
