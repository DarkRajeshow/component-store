// hooks/useFileUtils.ts
import { useCallback, useState, useRef } from "react";
import { IComponent, INormalComponent } from "@/types/project.types";
import { IDesign } from "@/types/design.types";
import { IProject } from "@/types/project.types";
import filePath from "@/utils/filePath";
import { checkFileExists } from "@/utils/checkFileExists";

interface ExistingFiles {
    [key: string]: boolean;
}

export const useFileUtils = () => {
    const [existingFiles, setExistingFiles] = useState<ExistingFiles>({});
    const checkingFiles = useRef<Set<string>>(new Set());

    // Stable function references using useCallback with minimal dependencies
    const getSVGPathForDesign = useCallback((
        value: IComponent | INormalComponent | null,
        page: string,
        design: IDesign
    ): string | null => {
        if (!value || !design.structure?.pages?.[page]) return null;

        const baseFilePath = `${filePath}/projects/${design.folder}/${design.categoryId}/${design.structure.pages[page]}`;

        // Handle INormalComponent type
        if ('value' in value && 'fileId' in value) {
            return `${baseFilePath}/${value.fileId}.svg`;
        }

        // Handle IComponent type
        const component = value as IComponent;
        if (component.selected === 'none') return null;

        const subOption = component.selected;
        if (!subOption || !component.options) return null;

        const selectedOption = component.options[subOption];
        if (!selectedOption) return null;

        const selectedOptionComponent = selectedOption as IComponent;

        // Handle nested options
        if (selectedOptionComponent.options && selectedOptionComponent.selected && selectedOptionComponent.selected !== " ") {
            const subSubOption = selectedOptionComponent.options[selectedOptionComponent.selected] as INormalComponent;
            if (subSubOption?.fileId) {
                return `${baseFilePath}/${subSubOption.fileId}.svg`;
            }
        }

        // Handle direct fileId
        const selectedOptionNormalComponent = selectedOption as INormalComponent;
        if (selectedOptionNormalComponent.fileId) {
            return `${baseFilePath}/${selectedOptionNormalComponent.fileId}.svg`;
        }

        return null;
    }, []); // Empty dependency array since it doesn't depend on changing values

    const getSVGPathForProject = useCallback((
        value: IComponent | INormalComponent | null,
        page: string,
        project: IProject,
        categoryId: string
    ): string | null => {
        if (!value || !project.hierarchy?.categories?.[categoryId]?.pages?.[page]) return null;

        const baseFilePath = `${filePath}/projects/${project.folder}/${categoryId}/${project.hierarchy.categories[categoryId].pages[page]}`;

        // Handle INormalComponent type
        if ('value' in value && 'fileId' in value) {
            return `${baseFilePath}/${value.fileId}.svg`;
        }

        // Handle IComponent type
        const component = value as IComponent;
        if (component.selected === 'none') return null;

        const subOption = component.selected;
        if (!subOption || !component.options) return null;

        const selectedOption = component.options[subOption];
        if (!selectedOption) return null;

        const selectedOptionComponent = selectedOption as IComponent;

        // Handle nested options
        if (selectedOptionComponent.options && selectedOptionComponent.selected && selectedOptionComponent.selected !== " ") {
            const subSubOption = selectedOptionComponent.options[selectedOptionComponent.selected] as INormalComponent;
            if (subSubOption?.fileId) {
                return `${baseFilePath}/${subSubOption.fileId}.svg`;
            }
        }

        // Handle direct fileId
        const selectedOptionNormalComponent = selectedOption as INormalComponent;
        if (selectedOptionNormalComponent.fileId) {
            return `${baseFilePath}/${selectedOptionNormalComponent.fileId}.svg`;
        }

        return null;
    }, []); // Empty dependency array

    const getBaseDrawingPath = useCallback((
        item: IDesign | IProject,
        page: string,
        categoryId?: string
    ): string | undefined => {
        if ('structure' in item) {
            // Design
            const design = item as IDesign;
            if (design.structure?.baseDrawing?.fileId && design.structure.pages?.[page]) {
                return `${filePath}/projects/${design.folder}/${design.categoryId}/${design.structure.pages[page]}/${design.structure.baseDrawing.fileId}.svg`;
            }
        } else {
            // Project
            const project = item as IProject;
            if (categoryId && project.hierarchy?.categories?.[categoryId]?.baseDrawing?.fileId && project.hierarchy.categories[categoryId].pages?.[page]) {
                return `${filePath}/projects/${project.folder}/${categoryId}/${project.hierarchy.categories[categoryId].pages[page]}/${project.hierarchy.categories[categoryId].baseDrawing.fileId}.svg`;
            }
        }
        return undefined;
    }, []); // Empty dependency array

    // Moved getAllFilePaths to be a regular function instead of useMemo to avoid dependency issues
    const getAllFilePaths = useCallback((item: IDesign | IProject, categoryId?: string): string[] => {
        const allPaths: string[] = [];

        if ('structure' in item) {
            // Design
            const design = item as IDesign;
            if (!design.structure?.pages || !design.structure?.components) return [];

            Object.keys(design.structure.pages).forEach((page) => {
                const paths = Object.values(design.structure.components || {})
                    .map((value) => getSVGPathForDesign(value, page, design))
                    .filter((path): path is string => Boolean(path));
                allPaths.push(...paths);
            });
        } else {
            // Project
            const project = item as IProject;
            if (!categoryId || !project.hierarchy?.categories?.[categoryId]) return [];

            const category = project.hierarchy.categories[categoryId];
            if (!category.pages || !category.components) return [];

            Object.keys(category.pages).forEach((page) => {
                const paths = Object.values(category.components || {})
                    .map((value) => getSVGPathForProject(value, page, project, categoryId))
                    .filter((path): path is string => Boolean(path));
                allPaths.push(...paths);
            });
        }

        return allPaths;
    }, [getSVGPathForDesign, getSVGPathForProject]);

    const checkFilesExistence = useCallback(async (filePaths: string[]) => {
        // Filter out paths that are already being checked or already exist in cache
        const pathsToCheck = filePaths.filter(path => 
            !checkingFiles.current.has(path) && !(path in existingFiles)
        );

        if (pathsToCheck.length === 0) return;

        // Mark paths as being checked
        pathsToCheck.forEach(path => checkingFiles.current.add(path));

        try {
            const results: ExistingFiles = {};
            
            // Use Promise.all for parallel checking but limit concurrency to avoid overwhelming the server
            const batchSize = 5;
            for (let i = 0; i < pathsToCheck.length; i += batchSize) {
                const batch = pathsToCheck.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(async (path) => {
                        try {
                            const exists = await checkFileExists(path);
                            return { path, exists };
                        } catch (error) {
                            console.warn(`Failed to check file existence for ${path}:`, error);
                            return { path, exists: false };
                        }
                    })
                );

                batchResults.forEach(({ path, exists }) => {
                    results[path] = exists;
                });
            }

            // Update state with results
            if (Object.keys(results).length > 0) {
                setExistingFiles((prev) => ({ ...prev, ...results }));
            }
        } finally {
            // Remove paths from checking set
            pathsToCheck.forEach(path => checkingFiles.current.delete(path));
        }
    }, []); // Removed existingFiles from dependencies to prevent infinite loop

    return {
        getSVGPathForDesign,
        getSVGPathForProject,
        getBaseDrawingPath,
        getAllFilePaths,
        checkFilesExistence,
        existingFiles
    };
};