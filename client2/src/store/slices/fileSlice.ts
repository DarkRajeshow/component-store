import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { StoreState } from '../../types/store';

// Define types for the file slice
interface FileState {
    uniqueFileName: string;
    fileVersion: number;
    newFiles: Record<string, any>;
    filesToDelete: any[];
    deleteFilesOfPages: any[];
    operations: Record<string, any>;
    fileList: Record<string, any>;
}

interface FileActions {
    setUniqueFileName: () => void;
    setFileVersion: () => void;
    incrementFileVersion: () => void;
    setFilesToDelete: (files: any[]) => void;
    setDeleteFilesOfPages: (files: any[]) => void;
    setNewFiles: (files: Record<string, any>) => void;
    setOperations: (operations: Record<string, any>) => void;
    setFileList: (newFileList: Record<string, any>) => void;
}

export type FileSlice = FileState & FileActions;

// Slice for user and file-related states
const createFileSlice: StateCreator<StoreState, [], [], FileSlice> = (set) => ({
    // fileName: '',
    uniqueFileName: uuidv4(),
    fileVersion: 1,
    newFiles: {},
    filesToDelete: [],
    deleteFilesOfPages: [],
    operations: {},
    fileList: {},

    // setFileName: (name) => set({ fileName: name }),
    // Set unique file name
    setUniqueFileName: () => set(() => ({ uniqueFileName: uuidv4() })),
    setFileVersion: () => set((state) => ({ fileVersion: state.fileVersion + 1 })),
    incrementFileVersion: () => set((state) => ({ fileVersion: state.fileVersion + 1 })),
    setFilesToDelete: (files) => set({ filesToDelete: files }),
    setDeleteFilesOfPages: (files) => set({ deleteFilesOfPages: files }),
    setNewFiles: (files) => set({ newFiles: files }),
    setOperations: (operations) => set({ operations }),
    setFileList: (newFileList) => set({ fileList: newFileList }),

    // Action to check if a file exists in the list
});

export default createFileSlice;