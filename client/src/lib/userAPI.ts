import { apiRequest } from "./apiClient";
import { IUser } from "@/types/user.types";

interface ReportingToResponse {
    data: IUser[];
    success: boolean;
}

export const getReportingTo = async (designation: string, department: string): Promise<IUser[]> => {
    try {
        if (!department) return [];
        const url = `/users/reporting-to?designation=${designation}&department=${department}`;
        console.log(`Requesting managers from: ${url}`);
        const response = await apiRequest<ReportingToResponse>('get', url);
        if (response && response.success && Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch reporting managers:", error);
        return [];
    }
};

export const deleteUser = async (userId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const url = `/users/${userId}`;
        const response = await apiRequest<{ success: boolean; message?: string }>('delete', url);
        return response;
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, message: 'Failed to delete user' };
    }
}; 