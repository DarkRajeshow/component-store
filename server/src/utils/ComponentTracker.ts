import { IDesignSnapshot, ISelectionPath, IComponent, IComponents, INormalComponent } from "../types/design.types";
/**
 * Core function to extract all selected component paths from the component structure
 * This creates a "snapshot" of what's currently selected for locking purposes
 */
export function extractSelectionPaths(
    components: IComponents,
    basePath: string = ''
): ISelectionPath[] {
    const paths: ISelectionPath[] = [];

    Object.entries(components).forEach(([componentKey, componentValue]) => {
        const currentPath = basePath ? `${basePath}.${componentKey}` : componentKey;

        if ('value' in componentValue && typeof componentValue.value === 'boolean') {
            // Boolean component (like TTB)
            if (componentValue.value) {
                paths.push({
                    componentPath: currentPath,
                    selectedOption: 'true',
                    fileId: componentValue.fileId
                });
            }
        } else if ('selected' in componentValue && componentValue.selected !== 'none') {
            // Dropdown component with options
            const selectedOption = componentValue.selected;
            const selectedOptionData = componentValue.options[selectedOption];

            if (selectedOptionData && 'fileId' in selectedOptionData) {
                // Simple option selected
                paths.push({
                    componentPath: currentPath,
                    selectedOption: selectedOption,
                    fileId: selectedOptionData.fileId
                });
            } else if (selectedOptionData && 'selected' in selectedOptionData) {
                // Nested option selected - recurse into it
                paths.push({
                    componentPath: currentPath,
                    selectedOption: selectedOption,
                    fileId: 'nested' // Marker for nested components
                });

                // Recursively extract from nested structure
                const nestedComponents = { [selectedOption]: selectedOptionData };
                const nestedPaths = extractSelectionPaths(nestedComponents as IComponents, currentPath);
                paths.push(...nestedPaths);
            }
        }
    });

    return paths;
}

/**
 * Check if a specific component path is locked (part of the original design selection)
 */
export function isComponentLocked(
    componentPath: string,
    selectedOption: string | boolean,
    designSnapshot: IDesignSnapshot
): boolean {
    return designSnapshot.selectionPaths.some(path => {
        if (path.componentPath === componentPath) {
            if (typeof selectedOption === 'boolean') {
                return path.selectedOption === 'true' && selectedOption === true;
            }
            return path.selectedOption === selectedOption;
        }
        return false;
    });
}

/**
 * Check if any part of a component tree is locked
 * Useful for parent components where any child might be locked
 */
export function isComponentTreeLocked(
    componentPath: string,
    designSnapshot: IDesignSnapshot
): boolean {
    return designSnapshot.selectionPaths.some(path =>
        path.componentPath.startsWith(componentPath)
    );
}

/**
 * Get the lock status for a component including detailed information
 */
export function getComponentLockStatus(
    componentPath: string,
    componentData: IComponent | INormalComponent,
    designSnapshot: IDesignSnapshot
) {
    const lockInfo = {
        isLocked: false,
        lockedOptions: [] as string[],
        reason: '',
        canEdit: true,
        canDelete: true,
        canRename: true
    };

    if ('value' in componentData && typeof componentData.value === 'boolean') {
        // Boolean component
        const isLocked = isComponentLocked(componentPath, componentData.value, designSnapshot);
        if (isLocked && componentData.value) {
            lockInfo.isLocked = true;
            lockInfo.reason = 'This component is part of the original design selection';
            lockInfo.canEdit = false;
            lockInfo.canDelete = false;
            lockInfo.canRename = false;
        }
    } else if ('selected' in componentData) {
        // Dropdown component
        designSnapshot.selectionPaths.forEach(path => {
            if (path.componentPath.startsWith(componentPath)) {
                const relativePath = path.componentPath.replace(componentPath, '').replace(/^\./, '');

                if (!relativePath) {
                    // Direct selection on this component
                    lockInfo.lockedOptions.push(path.selectedOption);
                } else {
                    // Nested selection - mark the parent option as locked
                    const parentOption = relativePath.split('.')[0];
                    if (!lockInfo.lockedOptions.includes(parentOption)) {
                        lockInfo.lockedOptions.push(parentOption);
                    }
                }
            }
        });

        if (lockInfo.lockedOptions.length > 0) {
            lockInfo.isLocked = true;
            lockInfo.reason = `Options [${lockInfo.lockedOptions.join(', ')}] are part of the original design`;
            // Can still edit non-locked options and add new components
            lockInfo.canEdit = true; // Partial editing allowed
            lockInfo.canDelete = false; // Can't delete if any option is locked
            lockInfo.canRename = false; // Can rename the component itself
        }
    }

    return lockInfo;
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
 * Create a design snapshot when exporting a design
 */
export function createDesignSnapshot(components: IComponents): IDesignSnapshot {
    const selectionPaths = extractSelectionPaths(components);
    const hash = generateSelectionHash(components);

    return {
        selectionPaths,
    };
}

/**
 * Check if current selection differs from the original design
 */
// export function hasSelectionChanged(
//     currentComponents: IComponents,
//     originalSnapshot: IDesignSnapshot
// ): boolean {
//     const currentHash = generateSelectionHash(currentComponents);
//     return currentHash !== originalSnapshot.hash;
// }

/**
 * Utility to get editable components (those not in the locked selection)
 */
export function getEditableComponents(
    components: IComponents,
    designSnapshot: IDesignSnapshot
): string[] {
    const editableComponents: string[] = [];

    Object.keys(components).forEach(componentKey => {
        const lockStatus = getComponentLockStatus(componentKey, components[componentKey], designSnapshot);
        if (!lockStatus.isLocked || lockStatus.canEdit) {
            editableComponents.push(componentKey);
        }
    });

    return editableComponents;
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