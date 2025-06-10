import { v4 as uuidv4 } from 'uuid';
import { IComponents, IComponent, IFileInfo, INestedParentLevel1 } from '@/types/design.types';

export interface FileUpdateMap {
    [oldFileId: string]: string; // oldFileId -> newFileId mapping
}

/**
 * Generates new file IDs for components that have file updates
 * @param newFiles - Object containing the new files to be uploaded
 * @returns Mapping of old file IDs to new file IDs
 */
export const generateNewFileIds = (newFiles: Record<string, Record<string, File>>): FileUpdateMap => {
    const fileUpdateMap: FileUpdateMap = {};

    Object.keys(newFiles).forEach(oldFileId => {
        if (Object.keys(newFiles[oldFileId]).length > 0) {
            fileUpdateMap[oldFileId] = uuidv4();
        }
    });

    return fileUpdateMap;
};

/**
 * Updates component structure with new file IDs
 * @param components - The components structure to update
 * @param fileUpdateMap - Mapping of old file IDs to new file IDs
 * @returns Updated components structure
 */
export const updateComponentFileIds = (
    components: IComponents,
    fileUpdateMap: FileUpdateMap
): IComponents => {
    const updatedComponents = JSON.parse(JSON.stringify(components)) as IComponents;

    const updateFileId = (obj: IComponent | IFileInfo | INestedParentLevel1) => {
        if (obj && typeof obj === 'object') {
            // Check if this object has a fileId that needs updating
            if ('fileId' in obj && obj.fileId && fileUpdateMap[obj.fileId]) {
                obj.fileId = fileUpdateMap[obj.fileId];
                console.log("working");
                console.log(obj);
                console.log(fileUpdateMap);
            }

            // Recursively check nested objects
            if ('options' in obj && obj.options) {
                Object.values(obj.options).forEach(option => {
                    updateFileId(option);
                });
            }
        }
    };

    // Update all components
    Object.values(updatedComponents).forEach(component => {
        updateFileId(component);
    });

    return updatedComponents;
};

/**
 * Creates a mapping of new file names with their new file IDs
 * @param newFiles - Object containing the new files
 * @param fileUpdateMap - Mapping of old file IDs to new file IDs
 * @returns Object with new file structure for upload
 */
export const createNewFileStructure = (
    newFiles: Record<string, Record<string, File>>,
    fileUpdateMap: FileUpdateMap
): Record<string, Record<string, File>> => {
    const newFileStructure: Record<string, Record<string, File>> = {};

    Object.entries(newFiles).forEach(([oldFileId, folderFiles]) => {
        const newFileId = fileUpdateMap[oldFileId];
        if (newFileId) {
            newFileStructure[newFileId] = folderFiles;
        }
    });

    return newFileStructure;
};