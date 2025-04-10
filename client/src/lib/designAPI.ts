import { apiRequest } from "../../../lib/apiClient";

export const addNewAttributeAPI = async (id, formData) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/option`, formData);
};

export const updateBaseDrawingAPI = async (id, formData) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/base`, formData);
};

export const shiftToSelectedCategoryAPI = async (id, formData) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/shift`, formData);
};

export const addNewParentAttributeAPI = async (id, updatedComponents) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/parent`, updatedComponents);
};

export const renameAttributeAPI = async (id, body) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/rename`, body);
};

export const updatecomponentsAPI = async (id, body) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/update`, body);
};

export const deletecomponentsAPI = async (id, body) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/delete`, body);
};

export const addNewPageAPI = async (id, body) => {
    return apiRequest('patch', `/api/designs/${id}/pages/add`, body);
};
