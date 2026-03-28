export const API_ENDPOINT = {
  INDEX: "/",
  AUTH: {
    LOGIN: "auth/login",
    LOGOUT:'auth/logout',
    REFRESH_TOKEN: "auth/refresh",
    VERIFY_EMAIL: "auth/verfiy-email",
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
} as const;
