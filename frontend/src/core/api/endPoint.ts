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
    VIEW_PROFILE: (profileId: number) => `personal-info/${profileId}`,
    UPDATE: (profileId: number) => `personal-info/update/${profileId}`,
    VIEW_LIST: "/personal-info",
    STATUS_UPDATE: (profileId: number) => `/personal-info/status/${profileId}`,
    ROLE_UPDATE: (profileId: number) => `/personal-info/role/${profileId}`,
    AVATAR_UPLOAD: `/file-upload`,
    AVATAR_UPDATE: (profileId: number) =>
      `/personal-info/update-image/${profileId}`,
    ADD_PROF: `/register/professor`,
    ADD_HOD: `/register/hod`,
  },
  SUBJECT: {
    VIEW: "/subject",
    VIEW_BY_ID: (id: number) => `/subject/${id}`,
    REGISTER: `/subject/register`,
    UPDATE: (id: number) => `/subject/${id}`,
  },
  STAFF: {
    REGISTER: `auth/register/staff`,
  },
} as const;
