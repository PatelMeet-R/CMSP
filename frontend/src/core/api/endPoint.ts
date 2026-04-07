export const API_ENDPOINT = {
  INDEX: "/",
  AUTH: {
    LOGIN: "auth/login",
    LOGOUT: "auth/logout",
    REFRESH_TOKEN: "auth/refresh",
    VERIFY_EMAIL: (token: string) => `/auth/verify-email?token=${token}`,
    SEND_VERIFICATION_MAIL: "auth/send-verification-mail",
    PASSWORD: {
      FORGOT_PASSWORD: "auth/forget-password",
      RESET_PASSWORD: (paramToken: string) =>
        `/auth/reset-password?token=${paramToken}`,
    },
    REGISTER: {
      USER: "auth/register",
      HOD: "auth/register/hod",
      PROFESSOR: "auth/register/professor",
    },
  },
  BRANCH: {
    VIEW: "branch/all",
    REGISTER: "branch/register",
    UPDATE: "branch",
  },
  PROFILE: {
    MY_PROFILE: "personal-info/profile",
    UPDATE: (profileId: number) => `personal-info/update/${profileId}`,
  },
  SUBJECT: {
    VIEW: "/subject",
    VIEW_BY_ID: (id: number) => `/subject/${id}`,
    REGISTER: `/subject/register`,
    UPDATE: (id: number) => `/subject/${id}`,
  },
} as const;
