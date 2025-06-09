import { IDesignSnapshot, ISelectionPath } from "@/types/design.types";
import { IComponent, IComponents, INestedChildLevel1, INormalComponent } from "@/types/project.types";

export interface ComponentLockStatus {
    isLocked: boolean;
    lockedOptions: string[];
    reason: string;
    canEdit: boolean;
    canDelete: boolean;
    canRename: boolean;
    lockLevel: 'none' | 'partial' | 'full';
    lockedPaths: ISelectionPath[];
}

/**
 * Extract all selection paths from components structure
 * This creates a snapshot of what's currently selected
 */
export function extractSelectionPaths(
    components: IComponents,
    basePath: string = ''
): ISelectionPath[] {
    const paths: ISelectionPath[] = [];

    Object.entries(components).forEach(([componentKey, componentValue]) => {
        const currentPath = basePath ? `${basePath}.${componentKey}` : componentKey;

        if ('value' in componentValue && typeof componentValue.value === 'boolean') {
            // Boolean component (INormalComponent)
            if (componentValue.value) {
                paths.push({
                    componentPath: currentPath,
                    selectedOption: 'true',
                    fileId: componentValue.fileId
                });
            }
        } else if ('selected' in componentValue && componentValue.selected !== 'none') {
            // IComponent with dropdown options
            const selectedOption = componentValue.selected;
            paths.push({
                componentPath: currentPath,
                selectedOption: selectedOption,
                fileId: getFileIdFromSelection(componentValue, selectedOption)
            });

            // Handle nested selections
            const selectedOptionData = componentValue.options[selectedOption];
            if (selectedOptionData && 'selected' in selectedOptionData && selectedOptionData.selected !== 'none') {
                // This is a nested parent (INestedParentLevel1)
                const nestedPaths = extractNestedSelectionPaths(
                    selectedOptionData,
                    `${currentPath}.${selectedOption}`
                );
                paths.push(...nestedPaths);
            }
        }
    });

    return paths;
}

/**
 * Helper function to extract paths from nested components
 */
function extractNestedSelectionPaths(
    nestedComponent: IComponent,
    basePath: string
): ISelectionPath[] {
    const paths: ISelectionPath[] = [];

    if ('selected' in nestedComponent && nestedComponent.selected !== 'none') {
        paths.push({
            componentPath: `${basePath}.${nestedComponent.selected}`,
            selectedOption: nestedComponent.selected,
            fileId: (nestedComponent.options[nestedComponent.selected] as INestedChildLevel1)?.fileId || 'unknown'
        });
    }

    return paths;
}

/**
 * Get fileId from a component selection
 */
function getFileIdFromSelection(component: IComponent, selectedOption: string): string {
    const optionData = component.options[selectedOption];
    if (optionData && 'fileId' in optionData) {
        return optionData.fileId;
    }
    return 'nested'; // For nested components without direct fileId
}

/**
 * Check if a component path or any of its children are locked
 */
export function isPathLocked(
    targetPath: string,
    designSnapshot: IDesignSnapshot
): boolean {
    return designSnapshot.selectionPaths.some(path =>
        path.componentPath === targetPath ||
        path.componentPath.startsWith(`${targetPath}.`)
    );
}

/**
 * Check if a component path is a parent of any locked path
 */
export function isParentOfLockedPath(
    targetPath: string,
    designSnapshot: IDesignSnapshot
): boolean {
    return designSnapshot.selectionPaths.some(path =>
        path.componentPath.startsWith(`${targetPath}.`)
    );
}

/**
 * Get all locked paths that are children of the given path
 */
export function getLockedChildPaths(
    parentPath: string,
    designSnapshot: IDesignSnapshot
): ISelectionPath[] {
    return designSnapshot.selectionPaths.filter(path =>
        path.componentPath.startsWith(`${parentPath}.`)
    );
}

/**
 * Get comprehensive lock status for a component
 */
export function getComponentLockStatus(
    componentPath: string,
    componentData: IComponent | INormalComponent,
    designSnapshot: IDesignSnapshot
): ComponentLockStatus {
    const lockStatus: ComponentLockStatus = {
        isLocked: false,
        lockedOptions: [],
        reason: '',
        canEdit: true,
        canDelete: true,
        canRename: true,
        lockLevel: 'none',
        lockedPaths: []
    };

    // Find all paths that affect this component
    const affectingPaths = designSnapshot.selectionPaths.filter(path =>
        path.componentPath === componentPath ||
        path.componentPath.startsWith(`${componentPath}.`)
    );

    if (affectingPaths.length === 0) {
        return lockStatus; // No locks affect this component
    }

    lockStatus.isLocked = true;
    lockStatus.lockedPaths = affectingPaths;

    // Handle boolean components (INormalComponent)
    if ('value' in componentData && typeof componentData.value === 'boolean') {
        const directLock = affectingPaths.find(path => path.componentPath === componentPath);
        if (directLock) {
            lockStatus.lockLevel = 'full';
            lockStatus.reason = 'This component is selected in the original design';
            lockStatus.canEdit = false; // Can't change the file
            lockStatus.canDelete = false; // Can't delete if selected
            lockStatus.canRename = false; // Can rename
        }
        return lockStatus;
    }

    // Handle dropdown components (IComponent)
    if ('selected' in componentData) {
        const directLocks = affectingPaths.filter(path => path.componentPath === componentPath);
        const childLocks = affectingPaths.filter(path =>
            path.componentPath.startsWith(`${componentPath}.`) &&
            path.componentPath !== componentPath
        );

        // Determine locked options
        directLocks.forEach(path => {
            lockStatus.lockedOptions.push(path.selectedOption);
        });

        childLocks.forEach(path => {
            const pathParts = path.componentPath.replace(`${componentPath}.`, '').split('.');
            const immediateChild = pathParts[0];
            if (!lockStatus.lockedOptions.includes(immediateChild)) {
                lockStatus.lockedOptions.push(immediateChild);
            }
        });

        // Determine lock level and permissions
        if (directLocks.length > 0) {
            // Component itself has direct selections
            if (childLocks.length > 0) {
                lockStatus.lockLevel = 'full';
                lockStatus.reason = `Component and nested options [${lockStatus.lockedOptions.join(', ')}] are part of the original design`;
            } else {
                lockStatus.lockLevel = 'partial';
                lockStatus.reason = `Option [${lockStatus.lockedOptions.join(', ')}] is part of the original design`;
            }

            lockStatus.canEdit = true; // Can edit non-locked options
            lockStatus.canDelete = false; // Can't delete if any option is locked
            lockStatus.canRename = false; // Can't rename component
        } else if (childLocks.length > 0) {
            // Only nested children are locked
            lockStatus.lockLevel = 'partial';
            lockStatus.reason = `Nested selections in [${lockStatus.lockedOptions.join(', ')}] are part of the original design`;

            lockStatus.canEdit = true; // Can edit non-locked options
            lockStatus.canDelete = false; // Can't delete because children are locked
            lockStatus.canRename = false; // Can't rename component
        }
    }

    return lockStatus;
}

/**
 * Check if a specific option within a component is locked
 */
export function isOptionLocked(
    componentPath: string,
    optionName: string,
    designSnapshot: IDesignSnapshot
): boolean {
    return designSnapshot.selectionPaths.some(path => {
        // Direct option lock
        if (path.componentPath === componentPath && path.selectedOption === optionName) {
            return true;
        }
        // Nested option lock
        if (path.componentPath.startsWith(`${componentPath}.${optionName}.`)) {
            return true;
        }
        return false;
    });
}

/**
 * Get lock status for a specific option
 */
export function getOptionLockStatus(
    componentPath: string,
    optionName: string,
    designSnapshot: IDesignSnapshot
): {
    isLocked: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canRename: boolean;
    reason: string;
} {
    const isLocked = isOptionLocked(componentPath, optionName, designSnapshot);

    if (!isLocked) {
        return {
            isLocked: false,
            canEdit: true,
            canDelete: true,
            canRename: true,
            reason: ''
        };
    }

    // Check if it's a direct selection or has nested selections
    const directLock = designSnapshot.selectionPaths.some(path =>
        path.componentPath === componentPath && path.selectedOption === optionName && path.fileId !== "nested"
    );

    const hasNestedLocks = designSnapshot.selectionPaths.some(path =>
        path.componentPath === componentPath && path.selectedOption === optionName
    );

    if (directLock) {
        return {
            isLocked: true,
            canEdit: false, // Can't edit files of directly selected options
            canDelete: false, // Can't delete selected options
            canRename: false, // Can rename options
            reason: 'This option is selected in the original design'
        };
    } else if (hasNestedLocks) {
        return {
            isLocked: true,
            canEdit: true, // Can edit the option itself, but not nested selections
            canDelete: false, // Can't delete if has nested selections
            canRename: false, // Can rename options
            reason: 'This option contains nested selections from the original design'
        };
    }

    return {
        isLocked: false,
        canEdit: true,
        canDelete: true,
        canRename: true,
        reason: ''
    };
}

/**
 * Create a design snapshot when exporting a design
 */
export function createDesignSnapshot(components: IComponents): IDesignSnapshot {
    const selectionPaths = extractSelectionPaths(components);
    return {
        selectionPaths
    };
}

/**
 * Generate hash for current component selection (for detecting changes)
 */
export function generateSelectionHash(components: IComponents): string {
    const selectionPaths = extractSelectionPaths(components);
    const sortedPaths = selectionPaths
        .sort((a, b) => a.componentPath.localeCompare(b.componentPath))
        .map(path => `${path.componentPath}:${path.selectedOption}:${path.fileId}`)
        .join('|');

    // Simple hash function (in production, use crypto or a proper hash library)
    let hash = 0;
    for (let i = 0; i < sortedPaths.length; i++) {
        const char = sortedPaths.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Check if current selection differs from the original design
 */
export function hasSelectionChanged(
    currentComponents: IComponents,
    originalSnapshot: IDesignSnapshot
): boolean {
    const currentPaths = extractSelectionPaths(currentComponents);
    const originalPaths = originalSnapshot.selectionPaths;

    if (currentPaths.length !== originalPaths.length) {
        return true;
    }

    // Sort both arrays for comparison
    const sortedCurrent = currentPaths.sort((a, b) => a.componentPath.localeCompare(b.componentPath));
    const sortedOriginal = originalPaths.sort((a, b) => a.componentPath.localeCompare(b.componentPath));

    // Compare each path
    for (let i = 0; i < sortedCurrent.length; i++) {
        const current = sortedCurrent[i];
        const original = sortedOriginal[i];

        if (
            current.componentPath !== original.componentPath ||
            current.selectedOption !== original.selectedOption ||
            current.fileId !== original.fileId
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Get all editable components (those that can be modified)
 */
export function getEditableComponents(
    components: IComponents,
    designSnapshot: IDesignSnapshot
): {
    fullyEditable: string[];
    partiallyEditable: string[];
    locked: string[];
} {
    const result = {
        fullyEditable: [] as string[],
        partiallyEditable: [] as string[],
        locked: [] as string[]
    };

    Object.keys(components).forEach(componentKey => {
        const lockStatus = getComponentLockStatus(componentKey, components[componentKey], designSnapshot);

        if (!lockStatus.isLocked) {
            result.fullyEditable.push(componentKey);
        } else if (lockStatus.lockLevel === 'partial') {
            result.partiallyEditable.push(componentKey);
        } else {
            result.locked.push(componentKey);
        }
    });

    return result;
}
// Example usage for file versioning strategy
export interface IFileVersion {
    version: number;
    fileId: string;
    createdAt: Date;
    usedInDesigns: string[]; // Track which designs use this version
}

export interface IVersionedFile {
    componentPath: string;
    currentVersion: number;
    versions: IFileVersion[];
}

/**
 * When updating a file in a project that has exported designs
 */
export function createNewFileVersion(
    existingFile: IVersionedFile,
    newFileId: string,
    // designsUsingFile: string[]
): IVersionedFile {
    const newVersion = existingFile.currentVersion + 1;

    return {
        ...existingFile,
        currentVersion: newVersion,
        versions: [
            ...existingFile.versions,
            {
                version: newVersion,
                fileId: newFileId,
                createdAt: new Date(),
                usedInDesigns: [] // New version starts with no designs
            }
        ]
    };
}