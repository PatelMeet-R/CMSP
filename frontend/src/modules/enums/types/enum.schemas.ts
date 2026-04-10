export const EnumCategory = {
  GENDER: "GENDER",
  ACADEMIC_YEAR: "ACADEMIC_YEAR",
  ACCOUNT_STATUS: "USER_ACCOUNT_STATUS",
  SEMESTER: "SEMESTER",
  USER_ROLE: "USER_ROLE",
} as const;

export type EnumCategory = (typeof EnumCategory)[keyof typeof EnumCategory];

export interface EnumValueResponse {
  id: number;
  key: string;
  value: string;
}
