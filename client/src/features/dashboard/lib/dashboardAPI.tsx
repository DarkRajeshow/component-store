import { apiRequest } from "../../../lib/apiClient";

// Example API call for fetching dashboard data
export const getDashboardDataAPI = async () => {
    return apiRequest('get', "/api/dashboard");
};

