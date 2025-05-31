import { apiRequest } from "../../../lib/apiClient";
import { ApiRequestMethod } from '../../../types/request.types';
import { IAddComponentRequest, IUpdateComponentRequest, IDeleteComponentRequest } from '../../../types/project.types';

export const addNewComponentAPI = async (id: string, formData: FormData) => {
    return apiRequest('patch' as ApiRequestMethod, `/api/designs/${id}/components/option`, formData);
};

export const updateBaseDrawingAPI = async (id: string, formData: FormData) => {
    return apiRequest('patch' as ApiRequestMethod, `/api/designs/${id}/components/base`, formData);
};

export const shiftToSelectedCategoryAPI = async (id: string, formData: FormData) => {
    return apiRequest('patch' as ApiRequestMethod, `/api/designs/${id}/components/shift`, formData);
};

export const addNewParentComponentAPI = async (id: string, updatedComponents: IAddComponentRequest) => {
    return apiRequest('patch' as ApiRequestMethod, `/api/designs/${id}/components/parent`, updatedComponents);
};

export const renameComponentAPI = async (id: string, body: IAddComponentRequest) => {
    return apiRequest('patch' as ApiRequestMethod, `/api/designs/${id}/components/rename`, body);
};

export const updatecomponentsAPI = async (id: string, body: IUpdateComponentRequest) => {
    return apiRequest('patch' as ApiRequestMethod, `/api/designs/${id}/components/update`, body);
};

export const deletecomponentsAPI = async (id: string, body: IDeleteComponentRequest) => {
    return apiRequest('patch' as ApiRequestMethod, `/api/designs/${id}/components/delete`, body);
};

export const addNewPageAPI = async (id: string, body: { pageName: string }) => {
    return apiRequest('patch' as ApiRequestMethod, `/api/designs/${id}/pages/add`, body);
};
