import { apiRequest } from "./apiClient";
import { ICreateProjectRequest, IProjectResponse, IGetProjectResponse, IGetProjectsResponse } from "../types/project.types";
import { ICreateDesignRequest, IDesignResponse, IGetDesignByHashResponse, IGetDesignResponse, IGetDesignsResponse } from "../types/design.types";
import { IUserLoginRequest, IUserLoginResponse, IUserRegisterRequest, IUserRegisterResponse, IUserResponse } from "../types/user.types";



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
export const getDesignByHash = async (hash: string) => {
    return apiRequest<IGetDesignByHashResponse>('get', `/api/designs/hash/${hash}`,);
};

export const createEmptyDesignAPI = async (formData: ICreateDesignRequest) => {
    return apiRequest<IDesignResponse>('post', "/api/designs/", formData);
};

export const getRecentDesignsAPI = async () => {
    return apiRequest<IGetDesignsResponse>('get', `/api/designs/recent`);
};



// Auth APIs
export const loginAPI = async (userCredentials: IUserLoginRequest) => {
    return apiRequest<IUserLoginResponse>('post', "/api/users/login", userCredentials);
};

export const registerAPI = async (userCredentials: IUserRegisterRequest) => {
    return apiRequest<IUserRegisterResponse>('post', "/api/users/register", userCredentials);
};

export const getUserAPI = async () => {
    return apiRequest<IUserResponse>('get', "/api/users/me");
};

export const logoutAPI = async () => {
    return apiRequest<IUserResponse>('post', "/api/users/logout");
};


