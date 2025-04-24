// src/contexts/ModelContext.tsx
import React, { createContext, useContext, useEffect, ReactNode, useCallback, useState } from 'react';
import { useModelApi, useStaticModelApi } from '../hooks/useModelApi';
import useAppStore from '@/store/useAppStore';
import {
    IProject, IAddComponentRequest, IAddPageRequest, IAddCategoryRequest,
    IComponentOperationResponse, IAddPageResponse, IRenamePageRequest,
    IRenamePageResponse, IDeletePageResponse, IAddCategoryResponse,
    IRenameCategoryRequest, IRenameCategoryResponse, IDeleteCategoryResponse,
    IShiftCategoryRequest, IShiftCategoryResponse,
    IRenameComponentRequest,
    IDeleteComponentRequest,
    IReorderPagesRequest,
    IReorderPagesResponse
} from '@/types/project.types';
import { IDesign } from '@/types/design.types';
import filePath from '@/utils/filePath';

interface ModelContextType {
    modelType: 'project' | 'design';
    id: string;
    categoryId?: string;
    baseContentPath: string;
    baseFolderPath: string;
    contentFolder: string;
    loading: boolean;
    error: Error | null;
    // Common operations
    updateContentPath: (categoryId: string) => void;
    refreshContent: () => Promise<void>;
    addComponent: (formData: FormData) => Promise<IComponentOperationResponse | null>;
    addParentComponent: (data: IAddComponentRequest) => Promise<IComponentOperationResponse | null>;
    updateBaseDrawing: (formData: FormData) => Promise<IComponentOperationResponse | null>;
    renameComponent: (data: IRenameComponentRequest) => Promise<IComponentOperationResponse | null>;
    updateComponent: (formData: FormData) => Promise<IComponentOperationResponse | null>;
    deleteComponent: (data: IDeleteComponentRequest) => Promise<IComponentOperationResponse | null>;
    addPage: (data: IAddPageRequest) => Promise<IAddPageResponse | null>;
    renamePage: (pageId: string, data: IRenamePageRequest) => Promise<IRenamePageResponse | null>;
    reorderPages: (data: IReorderPagesRequest) => Promise<IReorderPagesResponse | null>;
    deletePage: (pageId: string) => Promise<IDeletePageResponse | null>;
    // Project-specific operations
    shiftCategory?: (data: IShiftCategoryRequest) => Promise<IShiftCategoryResponse | null>;
    addCategory?: (data: IAddCategoryRequest) => Promise<IAddCategoryResponse | null>;
    renameCategory?: (categoryId: string, data: IRenameCategoryRequest) => Promise<IRenameCategoryResponse | null>;
    deleteCategory?: (categoryId: string) => Promise<IDeleteCategoryResponse | null>;
    // Check if it's a project
    isProject: boolean;
}

const ModelContext = createContext<ModelContextType | null>(null);

interface ModelProviderProps {
    modelType: 'project' | 'design';
    id: string;
    categoryId?: string;
    children: ReactNode;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({
    modelType,
    id,
    categoryId,
    children,
}) => {
    const { setContent, setDesignStates, setProjectStates, setLoading } = useAppStore()
    const [contentFolder, setContentFolder] = useState<string>("")
    const [baseContentPath, setBaseContentPath] = useState<string>("")
    const [baseFolderPath, setBaseFolderPath] = useState<string>("")
    const isProject = modelType === 'project';

    // // Initialize API
    const api = useModelApi({ modelType, id, categoryId });

    // // Load data
    const fetchContent = useCallback(async () => {
        const response = await api.getById();
        if (response?.success) {
            if (isProject && 'project' in response && response.project) {
                const project = response.project as IProject;
                setContent(project)
                setProjectStates(project);
                const currentCategoryId = project?.hierarchy.categoryMapping[project?.selectedCategory as string];
                const completeFilePath = `${filePath}/projects/${project.folder}/${currentCategoryId}`
                const completeFolderPath = `${filePath}/projects/${project.folder}`
                setBaseContentPath(completeFilePath)
                setBaseFolderPath(completeFolderPath)
                setContentFolder(project.folder)
            }
            else if ('design' in response && response.design) {
                const design = response.design as IDesign;
                setContent(design);
                setDesignStates(design);
                const completeFilePath = `${filePath}/projects/${design.folder}/${design.categoryId}`
                const completeFolderPath = `${filePath}/projects/${design.folder}`
                setBaseContentPath(completeFilePath)
                setBaseFolderPath(completeFolderPath)
                setContentFolder(design.folder)
            }
            else {
                setContent(null);
            }
        }
        setLoading(false);
    }, [isProject, setContent, setDesignStates, setProjectStates, setLoading]);

    const updateContentPath = (categoryId: string) => {
        setBaseContentPath(`${baseFolderPath}/${categoryId}`)
    }

    useEffect(() => {
        fetchContent();
    }, [modelType, id, fetchContent]);

    const contextValue: ModelContextType = {
        modelType,
        id,
        categoryId,
        baseContentPath,
        baseFolderPath,
        contentFolder,
        loading: api.loading,
        error: api.error,
        // Common operations
        updateContentPath: updateContentPath,
        refreshContent: fetchContent,
        addComponent: api.addComponent,
        addParentComponent: api.addParentComponent,
        updateBaseDrawing: api.updateBaseDrawing,
        renameComponent: api.renameComponent,
        updateComponent: api.updateComponent,
        deleteComponent: api.deleteComponent,
        addPage: api.addPage,
        renamePage: api.renamePage,
        reorderPages: api.reorderPages,
        deletePage: api.deletePage,
        // Project-specific operations
        ...(isProject ? {
            shiftCategory: api.shiftCategory,
            addCategory: api.addCategory,
            renameCategory: api.renameCategory,
            deleteCategory: api.deleteCategory,
        } : {}),
        isProject,
    };

    return (
        <ModelContext.Provider value={contextValue}>
            {children}
        </ModelContext.Provider>
    );
};

export const useModel = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModel must be used within a ModelProvider');
    }
    return context;
};

// Hook for static operations that don't require a specific model instance
export const useModelStatic = useStaticModelApi;