import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  LoginInput,
  LoginResponse,
} from "@/modules/auth/types/loginSchema";
import type { SignupInput } from "@/modules/auth/types/signupSchema";
import Cookies from "js-cookie";

export const loginUser = async (
  credentials: LoginInput,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post(
    API_ENDPOINT.AUTH.LOGIN,
    credentials,
  );
  const data = response.data.data;

  Cookies.set("accessToken", data.accessToken, { expires: 1, secure: true });
  Cookies.set("refreshToken", data.refreshToken, { expires: 7, secure: true });

  return response.data;
};

export const logoutUser = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};

export const registerUser = async (data: SignupInput) => {
  const response = await axiosInstance.post(
    API_ENDPOINT.AUTH.REGISTER.USER,
    data,
  );
  return response.data;
};
