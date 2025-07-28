import { IUserLoginRequest, IUserLoginResponse, IUserRegisterRequest, IUserRegisterResponse } from "@/types/user.types";
import { apiRequest } from "../../../lib/apiClient";

export const loginAPI = async (userCredentials: IUserLoginRequest) => {
    return apiRequest<IUserLoginResponse>('post', "/api/users/sign-in", userCredentials);
};

export const registerAPI = async (userCredentials: IUserRegisterRequest) => {
    return apiRequest<IUserRegisterResponse>('post', "/api/users/sign-up", userCredentials);
};