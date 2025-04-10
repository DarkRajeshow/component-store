// src/contexts/ModelContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useModelApi, useStaticModelApi } from '../hooks/useModelApi';

interface ModelContextType {
    modelType: 'project' | 'design';
    id: string;
    categoryId?: string;
    data: any;
    loading: boolean;
    error: Error | null;
    refreshData: () => Promise<void>;
    // Common operations
    addComponent: (formData: FormData) => Promise<any>;
    addParentComponent: (data: any) => Promise<any>;
    updateBaseDrawing: (formData: FormData) => Promise<any>;
    renameComponent: (data: any) => Promise<any>;
    updateComponent: (formData: FormData) => Promise<any>;
    deleteComponent: (data: any) => Promise<any>;
    addPage: (data: any) => Promise<any>;
    renamePage: (pageId: string, data: any) => Promise<any>;
    deletePage: (pageId: string) => Promise<any>;
    // Project-specific operations
    addCategory?: (data: any) => Promise<any>;
    renameCategory?: (categoryId: string, data: any) => Promise<any>;
    deleteCategory?: (categoryId: string) => Promise<any>;
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
    const [data, setData] = useState<any>(null);
    const isProject = modelType === 'project';

    // Initialize API
    const api = useModelApi({ modelType, id, categoryId });

    // Load data
    const fetchData = useCallback(async () => {
        const result = await api.getById();
        if (result) {
            setData(result);
        }
    }, [api]);

    useEffect(() => {
        fetchData();
    }, [modelType, id, categoryId, fetchData]);

    const contextValue: ModelContextType = {
        modelType,
        id,
        categoryId,
        data,
        loading: api.loading,
        error: api.error,
        refreshData: fetchData,
        // Common operations
        addComponent: api.addComponent,
        addParentComponent: api.addParentComponent,
        updateBaseDrawing: api.updateBaseDrawing,
        renameComponent: api.renameComponent,
        updateComponent: api.updateComponent,
        deleteComponent: api.deleteComponent,
        addPage: api.addPage,
        renamePage: api.renamePage,
        deletePage: api.deletePage,
        // Project-specific operations
        ...(isProject ? {
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