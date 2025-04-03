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

export const addNewParentAttributeAPI = async (id, updatedAttributes) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/parent`, updatedAttributes);
};

export const renameAttributeAPI = async (id, body) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/rename`, body);
};

export const updateDesignAttributesAPI = async (id, body) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/update`, body);
};

export const deleteDesignAttributesAPI = async (id, body) => {
    return apiRequest('patch', `/api/designs/${id}/attributes/delete`, body);
};

export const addNewPageAPI = async (id, body) => {
    return apiRequest('patch', `/api/designs/${id}/pages/add`, body);
};
