import { apiRequest } from "./apiClient";
import { IDesign, IUser, ApiResponse, CreateDesignRequest } from "../types/types"; // Import from the types file we created earlier

// Design APIs
export const createEmptyDesignAPI = async (formData: CreateDesignRequest) => {
    return apiRequest<ApiResponse<IDesign>>('post', "/api/designs/", formData);
};

export const getDesignByIdAPI = async (designId: string) => {
    return apiRequest<ApiResponse<IDesign>>('get', `/api/designs/${designId}`);
};

export const getRecentDesignsAPI = async () => {
    return apiRequest<ApiResponse<IDesign[]>>('get', `/api/designs/recent`);
};

// Auth APIs
export const getUserAPI = async () => {
    return apiRequest<ApiResponse<IUser>>('get', "/api/users");
};

export const logoutAPI = async () => {
    return apiRequest<ApiResponse<null>>('post', "/api/users/logout");
};