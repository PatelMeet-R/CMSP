import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  ForgetPasswordInput,
  LoginInput,
  LoginResponse,
  resetPasswordInput,
  SignupInput,
} from "@/modules/auth/types/auth.schemas";

import Cookies from "js-cookie";

export const loginUser = async (
  credentials: LoginInput,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post(
    API_ENDPOINT.AUTH.LOGIN,
    credentials,
  );
  const data = response.data.data;
  const isSecure = window.location.protocol === "https:";

  Cookies.set("accessToken", data.accessToken, {
    expires: 1,
    secure: isSecure,
  });
  Cookies.set("refreshToken", data.refreshToken, {
    expires: 7,
    secure: isSecure,
  });

  return response.data;
};

export const logoutUser = async () => {
  try {
    const token = Cookies.get("accessToken");
    await axiosInstance.post(
      API_ENDPOINT.AUTH.LOGOUT,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.error(
      "Backend logout failed, but clearing local state anyway.",
      error,
    );
  }
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  sessionStorage.clear();
  localStorage.clear();
};

export const registerUser = async (data: SignupInput) => {
  const response = await axiosInstance.post(
    API_ENDPOINT.AUTH.REGISTER.USER,
    data,
  );
  return response.data;
};
export const ForgetPassword = async (data: ForgetPasswordInput) => {
  const response = await axiosInstance.post(
    API_ENDPOINT.AUTH.PASSWORD.FORGOT_PASSWORD,
    data,
  );

  return response.data;
};
export const ResetPassword = async (
  token: string,
  data: resetPasswordInput,
) => {
  const response = await axiosInstance.post(
    API_ENDPOINT.AUTH.PASSWORD.RESET_PASSWORD(token),
    data,
  );
  return response.data;
};

export const sendVerificationEmail = async () => {
  const response = await axiosInstance.post(
    API_ENDPOINT.AUTH.SEND_VERIFICATION_MAIL,
  );
  return response.data;
};

export const verifyEmailToken = async (token: string) => {
  const response = await axiosInstance.get(
    API_ENDPOINT.AUTH.VERIFY_EMAIL(token),
  );
  return response.data;
};
