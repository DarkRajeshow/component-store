// src/services/apiAdapter.ts
import { apiRequest } from "../lib/apiClient";
import {
    IProjectResponse, ICreateProjectRequest, ICreateProjectResponse,
    IAddComponentRequest, IComponentOperationResponse, IRenameComponentRequest,
    IDeleteComponentRequest, IAddPageRequest,
    IAddPageResponse, IRenamePageRequest, IRenamePageResponse,
    IDeletePageResponse, IAddCategoryRequest, IAddCategoryResponse,
    IRenameCategoryRequest, IRenameCategoryResponse, IDeleteCategoryResponse,
    IGetProjectResponse, IGetProjectsResponse, IGetRecentProjectsResponse
} from "../types/project.types";
import {
    IDesignResponse, ICreateDesignRequest, ICreateDesignResponse,
    IUpdateBaseDrawingResponse,
    IGetDesignResponse, IGetDesignsResponse, IGetRecentDesignsResponse
} from "../types/design.types";

/**
 * API Adapter Service to handle the differences between Project and Design model API routes
 * This adapter creates a unified interface for components while routing to correct endpoints
 */
export class ApiAdapter {
    private readonly modelType: 'project' | 'design';
    private readonly id: string;
    private readonly categoryId?: string;

    constructor(modelType: 'project' | 'design', id: string, categoryId?: string) {
        this.modelType = modelType;
        this.id = id;
        this.categoryId = categoryId;
    }

    /**
     * Builds the base route path depending on the model type
     */
    private getBasePath(): string {
        if (this.modelType === 'project') {
            if (!this.categoryId) {
                throw new Error('Category ID is required for project operations');
            }
            return `/api/projects/${this.id}/categories/${this.categoryId}`;
        }
        return `/api/designs/${this.id}`;
    }

    /**
     * Add a new component (child)
     */
    async addComponent(formData: FormData): Promise<IComponentOperationResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/components/add/child`
            : `${this.getBasePath()}/components/add/child`;

        return apiRequest('put', endpoint, formData);
    }

    /**
     * Add a new parent component
     */
    async addParentComponent(data: IAddComponentRequest): Promise<IComponentOperationResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/components/add/parent`
            : `${this.getBasePath()}/components/add/parent`;

        return apiRequest('put', endpoint, data);
    }

    /**
     * Update the base drawing
     */
    async updateBaseDrawing(formData: FormData): Promise<IUpdateBaseDrawingResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/base`
            : `${this.getBasePath()}/base`;

        return apiRequest('put', endpoint, formData);
    }

    /**
     * Rename a component
     */
    async renameComponent(data: IRenameComponentRequest): Promise<IComponentOperationResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/components/rename`
            : `${this.getBasePath()}/components/rename`;

        return apiRequest('put', endpoint, data);
    }

    /**
     * Update a component
     */
    async updateComponent(formData: FormData): Promise<IComponentOperationResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/components/update`
            : `${this.getBasePath()}/components/update`;

        return apiRequest('put', endpoint, formData);
    }

    /**
     * Delete a component
     */
    async deleteComponent(data: IDeleteComponentRequest): Promise<IComponentOperationResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/components`
            : `${this.getBasePath()}/components`;

        return apiRequest('delete', endpoint, data);
    }

    /**
     * Add a new page
     */
    async addPage(data: IAddPageRequest): Promise<IAddPageResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/pages`
            : `${this.getBasePath()}/pages`;

        return apiRequest('put', endpoint, data);
    }

    /**
     * Rename a page
     */
    async renamePage(pageId: string, data: IRenamePageRequest): Promise<IRenamePageResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/pages/${pageId}/rename`
            : `${this.getBasePath()}/pages/${pageId}/rename`;

        return apiRequest('put', endpoint, data);
    }

    /**
     * Delete a page
     */
    async deletePage(pageId: string): Promise<IDeletePageResponse> {
        const endpoint = this.modelType === 'project'
            ? `${this.getBasePath()}/pages/${pageId}`
            : `${this.getBasePath()}/pages/${pageId}`;

        return apiRequest('delete', endpoint);
    }

    // Project-specific operations
    /**
     * Add a new category (Project only)
     */
    async addCategory(data: IAddCategoryRequest): Promise<IAddCategoryResponse> {
        if (this.modelType !== 'project') {
            throw new Error('Operation not supported for design model');
        }
        return apiRequest('put', `/api/projects/${this.id}/categories`, data);
    }

    /**
     * Rename a category (Project only)
     */
    async renameCategory(categoryId: string, data: IRenameCategoryRequest): Promise<IRenameCategoryResponse> {
        if (this.modelType !== 'project') {
            throw new Error('Operation not supported for design model');
        }
        return apiRequest('put', `/api/projects/${this.id}/categories/${categoryId}/rename`, data);
    }

    /**
     * Delete a category (Project only)
     */
    async deleteCategory(categoryId: string): Promise<IDeleteCategoryResponse> {
        if (this.modelType !== 'project') {
            throw new Error('Operation not supported for design model');
        }
        return apiRequest('delete', `/api/projects/${this.id}/categories/${categoryId}`);
    }

    /**
     * Get model by ID
     */
    async getById(): Promise<IGetProjectResponse | IGetDesignResponse> {
        const endpoint = this.modelType === 'project'
            ? `/api/projects/${this.id}`
            : `/api/designs/${this.id}`;

        return apiRequest('get', endpoint);
    }

    /**
     * Get recent models
     */
    static async getRecent(modelType: 'project' | 'design'): Promise<IGetRecentProjectsResponse | IGetRecentDesignsResponse> {
        const endpoint = modelType === 'project'
            ? '/api/projects/recent'
            : '/api/designs/recent';

        return apiRequest('get', endpoint);
    }

    /**
     * Get user's models
     */
    static async getUserModels(modelType: 'project' | 'design'): Promise<IGetProjectsResponse | IGetDesignsResponse> {
        const endpoint = modelType === 'project'
            ? '/api/projects'
            : '/api/designs';

        return apiRequest('get', endpoint);
    }

    /**
     * Create a new model
     */
    static async create(modelType: 'project' | 'design', data: ICreateProjectRequest | ICreateDesignRequest): Promise<ICreateProjectResponse | ICreateDesignResponse> {
        const endpoint = modelType === 'project'
            ? '/api/projects'
            : '/api/designs';

        return apiRequest('post', endpoint, data);
    }

    /**
     * Delete a model
     */
    static async delete(modelType: 'project' | 'design', id: string): Promise<IProjectResponse | IDesignResponse> {
        const endpoint = modelType === 'project'
            ? `/api/projects/${id}`
            : `/api/designs/${id}`;

        return apiRequest('delete', endpoint);
    }
}