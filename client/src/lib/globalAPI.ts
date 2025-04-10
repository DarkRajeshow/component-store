import { apiRequest } from "./apiClient";
import { ICreateProjectRequest, IProjectResponse, IGetProjectResponse, IGetProjectsResponse } from "../types/project.types";
import { ICreateDesignRequest, IDesignResponse, IGetDesignResponse, IGetDesignsResponse } from "../types/design.types";
import { IUser } from "../types/user.types";

interface ApiResponse<T> {
    success: boolean;
    status: string;
    data?: T;
}

// Project APIs
export const createEmptyProjectAPI = async (formData: ICreateProjectRequest) => {
    return apiRequest<IProjectResponse>('post', "/api/projects/", formData);
};

export const getProjectByIdAPI = async (projectId: string) => {
    return apiRequest<IGetProjectResponse>('get', `/api/projects/${projectId}`);
};

export const getDesignByIdAPI = async (designId: string) => {
    return apiRequest<IGetDesignResponse>('get', `/api/designs/${designId}`);
};

export const getRecentProjectsAPI = async () => {
    return apiRequest<IGetProjectsResponse>('get', `/api/projects/recent`);
};

// Design APIs
export const createEmptyDesignAPI = async (formData: ICreateDesignRequest) => {
    return apiRequest<IDesignResponse>('post', "/api/designs/", formData);
};

export const getRecentDesignsAPI = async () => {
    return apiRequest<IGetDesignsResponse>('get', `/api/designs/recent`);
};

// Auth APIs
export const getUserAPI = async () => {
    return apiRequest<ApiResponse<IUser>>('get', "/api/users");
};

export const logoutAPI = async () => {
    return apiRequest<ApiResponse<null>>('post', "/api/users/logout");
};