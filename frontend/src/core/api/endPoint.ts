export const API_ENDPOINT = {
  INDEX: "/",
  AUTH: {
    LOGIN: "auth/login",
    REFRESH_TOKEN: "auth/refresh",
    VERIFY_EMAIL: "auth/verfiy-email",
    PASSWORD: {
      FORGOT_PASSWORD: "auth/forgot-password",
      RESET_PASSWORD: "auth/reset-password",
    },
    REGISTER: {
      USER: "auth/register",
      HOD: "auth/register/hod",
      PROFESSOR: "auth/register/professor",
    },
  },
} as const;
