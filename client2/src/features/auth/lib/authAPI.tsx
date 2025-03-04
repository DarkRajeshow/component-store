import { apiRequest } from "../../../lib/apiClient";
import { ApiResponse, IUser, UserLoginRequest, UserSignupRequest } from "../../../types/types";

export const loginAPI = async (userCredentials: UserLoginRequest) => {
    return apiRequest<ApiResponse<IUser>>('post', "/api/users/login", userCredentials, { withCredentials: true });
};

export const registerAPI = async (userCredentials: UserSignupRequest) => {
    return apiRequest<ApiResponse<IUser>>('post', "/api/users/register", userCredentials, { withCredentials: true });
};