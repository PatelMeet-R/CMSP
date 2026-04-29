import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  ForgetPasswordInput,
  LoginInput,
  LoginResponse,
  resetPasswordInput,
  SignupInput,
} from "@/modules/auth/types/auth.schemas";

// =============================================
//  V2 Auth Service — HttpOnly Cookie Auth
//  Tokens are set/cleared by the BACKEND via Set-Cookie headers.
//  Frontend never touches tokens directly.
// =============================================

export const loginUser = async (
  credentials: LoginInput,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post(
    API_ENDPOINT.AUTH.LOGIN,
    credentials,
  );
  // Backend sets accessToken + refreshToken as HttpOnly cookies.
  // We only return the user data for Redux.
  return response.data;
};

export const logoutUser = async () => {
  try {
    // Backend clears the HttpOnly cookies via res.clearCookie()
    await axiosInstance.post(API_ENDPOINT.AUTH.LOGOUT, {});
  } catch (error) {
    console.error(
      "Backend logout failed, but clearing local state anyway.",
      error,
    );
  }
  // Clear any client-side state
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
