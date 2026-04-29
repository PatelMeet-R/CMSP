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
    VIEW_PROFILE: (profileId: string) => `personal-info/${profileId}`,
    UPDATE: (profileId: string) => `personal-info/update/${profileId}`,
    VIEW_LIST: "/personal-info",
    STATUS_UPDATE: (profileId: string) => `/personal-info/status/${profileId}`,
    ROLE_UPDATE: (profileId: string) => `/personal-info/role/${profileId}`,
    AVATAR_UPLOAD: `/file-upload`,
    AVATAR_UPDATE: (profileId: string) =>
      `/personal-info/update-image/${profileId}`,
    ADD_PROF: `/register/professor`,
    ADD_HOD: `/register/hod`,
  },
  SUBJECT: {
    VIEW: "/subject",
    VIEW_BY_ID: (id: string) => `/subject/${id}`,
    REGISTER: `/subject/register`,
    UPDATE: (id: string) => `/subject/${id}`,
    ASSIGN: `/professor-subject/assign-subject`,
    UNASSIGN: (mappingId: string) => `/professor-subject/unassign/${mappingId}`,
    VIEW_PROFESSOR_SUBJECT: `/professor-subject`,
  },
  STAFF: {
    VIEW: (userId: string) => `/staff-profile/${userId}`,
    SUBJECT_HISTORY: (userId: string) => `/professor-subject/history/${userId}`,
    REGISTER: `/auth/register/staff`,
    SEARCH_STAFF: `/personal-info/search-staff-combobox`,
    SEARCH_SUBJECT: `/subject/search-combobox`,
  },
  SETTING: {
    GET: (key: string) => `/settings/${key}`,
    UPSERT: "/settings/upsert",
  },
  ASSIGNMENT: {
    ADD: `/assignment/create`,
    LIST: `/assignment/all`,
    VIEW: (assignmentId: string) => `/assignment/${assignmentId}`,
    UPDATE: (assignmentId: string) => `/assignment/${assignmentId}`,
    DELETE: (assignmentId: string) => `/assignment/${assignmentId}`,
  },
  FILE: {
    UPLOAD: `/file-upload`,
    DELETE: (fileId: string) => `/file-upload/${fileId}`,
  },
  PERMISSION: {
    GET_USER: (personalInfoId: string) =>
      `/user-permissions/matrix/${personalInfoId}`,
    SAVE_USER: (personalInfoId: string) =>
      `/user-permissions/bulk/${personalInfoId}`,
  },
} as const;
