// src/hooks/useModelApi.ts
import { useState, useCallback } from 'react';
import { ApiAdapter } from '../services/apiAdapter';
import {
    IAddComponentRequest, IAddPageRequest, IAddCategoryRequest,
    IComponentOperationResponse, IAddPageResponse, IRenamePageRequest,
    IRenamePageResponse, IDeletePageResponse, IAddCategoryResponse,
    IRenameCategoryRequest, IRenameCategoryResponse, IDeleteCategoryResponse,
    IShiftCategoryRequest, IShiftCategoryResponse,
    IGetProjectsResponse, ICreateProjectRequest,
    ICreateProjectResponse, IProjectResponse,
    IRenameComponentRequest,
    IDeleteComponentRequest,
    IReorderPagesRequest,
    IReorderPagesResponse
} from '../types/project.types';
import {
    IGetDesignsResponse,
    ICreateDesignRequest, ICreateDesignResponse, IDesignResponse
} from '../types/design.types';

interface UseModelApiOptions {
    modelType: 'project' | 'design';
    id: string;
    categoryId?: string;
}

export const useModelApi = ({ modelType, id, categoryId }: UseModelApiOptions) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Create an adapter instance
    const apiAdapter = useCallback(() => {
        try {
            return new ApiAdapter(modelType, id, categoryId);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create API adapter'));
            return null;
        }
    }, [modelType, id, categoryId]);

    // Generic wrapper to handle API calls with loading and error states
    const apiCall = useCallback(async <T>(
        fn: () => Promise<T>
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await fn();
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('API call failed'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Wrapped API methods
    const addComponent = useCallback(
        (formData: FormData) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall(() => adapter.addComponent(formData));
        },
        [apiAdapter, apiCall]
    );

    const addParentComponent = useCallback(
        (data: IAddComponentRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IComponentOperationResponse>(() => adapter.addParentComponent(data));
        },
        [apiAdapter, apiCall]
    );

    const updateBaseDrawing = useCallback(
        (formData: FormData) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall(() => adapter.updateBaseDrawing(formData));
        },
        [apiAdapter, apiCall]
    );

    const renameComponent = useCallback(
        (data: IRenameComponentRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall(() => adapter.renameComponent(data));
        },
        [apiAdapter, apiCall]
    );

    const updateComponent = useCallback(
        (formData: FormData) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall(() => adapter.updateComponent(formData));
        },
        [apiAdapter, apiCall]
    );

    const deleteComponent = useCallback(
        (data: IDeleteComponentRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall(() => adapter.deleteComponent(data));
        },
        [apiAdapter, apiCall]
    );

    const addPage = useCallback(
        (data: IAddPageRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IAddPageResponse>(() => adapter.addPage(data));
        },
        [apiAdapter, apiCall]
    );

    const renamePage = useCallback(
        (pageId: string, data: IRenamePageRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IRenamePageResponse>(() => adapter.renamePage(pageId, data));
        },
        [apiAdapter, apiCall]
    );

    const reorderPages = useCallback(
        (data: IReorderPagesRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IReorderPagesResponse>(() => adapter.reorderPages(data));
        },
        [apiAdapter, apiCall]
    );

    const deletePage = useCallback(
        (pageId: string) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IDeletePageResponse>(() => adapter.deletePage(pageId));
        },
        [apiAdapter, apiCall]
    );

    // Project-specific operations
    const addCategory = useCallback(
        (data: IAddCategoryRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IAddCategoryResponse>(() => adapter.addCategory(data));
        },
        [apiAdapter, apiCall]
    );

    const shiftCategory = useCallback(
        (data: IShiftCategoryRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IShiftCategoryResponse>(() => adapter.shiftCategory(data));
        },
        [apiAdapter, apiCall]
    );

    const renameCategory = useCallback(
        (categoryId: string, data: IRenameCategoryRequest) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IRenameCategoryResponse>(() => adapter.renameCategory(categoryId, data));
        },
        [apiAdapter, apiCall]
    );

    const deleteCategory = useCallback(
        (categoryId: string) => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall<IDeleteCategoryResponse>(() => adapter.deleteCategory(categoryId));
        },
        [apiAdapter, apiCall]
    );

    // Static methods wrapped as regular functions
    const getById = useCallback(
        () => {
            const adapter = apiAdapter();
            if (!adapter) return Promise.resolve(null);
            return apiCall(() => adapter.getById());
        },
        [apiAdapter, apiCall]
    );

    return {
        loading,
        error,
        // Common operations
        addComponent,
        addParentComponent,
        updateBaseDrawing,
        renameComponent,
        updateComponent,
        deleteComponent,
        addPage,
        renamePage,
        reorderPages,
        deletePage,
        getById,
        // Project-specific operations
        ...(modelType === 'project' ? {
            addCategory,
            shiftCategory,
            renameCategory,
            deleteCategory,
        } : {}),
    };
};

// Static API methods that don't require an instance
export const useStaticModelApi = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Generic wrapper to handle API calls with loading and error states
    const apiCall = useCallback(async <T>(
        fn: () => Promise<T>
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await fn();
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('API call failed'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRecent = useCallback(
        (modelType: 'project' | 'design') => {
            return apiCall(() => ApiAdapter.getRecent(modelType));
        },
        [apiCall]
    );

    const getUserModels = useCallback(
        (modelType: 'project' | 'design') => {
            return apiCall<IGetProjectsResponse | IGetDesignsResponse>(() => ApiAdapter.getUserModels(modelType));
        },
        [apiCall]
    );

    const create = useCallback(
        (modelType: 'project' | 'design', data: ICreateProjectRequest | ICreateDesignRequest) => {
            return apiCall<ICreateProjectResponse | ICreateDesignResponse>(() => ApiAdapter.create(modelType, data));
        },
        [apiCall]
    );

    const deleteModel = useCallback(
        (modelType: 'project' | 'design', id: string) => {
            return apiCall<IProjectResponse | IDesignResponse>(() => ApiAdapter.delete(modelType, id));
        },
        [apiCall]
    );

    return {
        loading,
        error,
        getRecent,
        getUserModels,
        create,
        deleteModel,
    };
};