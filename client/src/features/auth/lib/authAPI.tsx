import { IUserLoginRequest, IUserLoginResponse, IUserRegisterResponse } from "@/types/user.types";
import { apiRequest } from "../../../lib/apiClient";
import { UserSignupRequest } from "../../../../../deprecated/client/types/design.types";

export const loginAPI = async (userCredentials: IUserLoginRequest) => {
    return apiRequest<IUserLoginResponse>('post', "/api/users/login", userCredentials);
};

export const registerAPI = async (userCredentials: UserSignupRequest) => {
    return apiRequest<IUserRegisterResponse>('post', "/api/users/register", userCredentials);
};