import { z } from "zod";

export const EnumCategory = {
  GENDER: "GENDER",
  ACADEMIC_YEAR: "ACADEMIC_YEAR",
  ACCOUNT_STATUS: "USER_ACCOUNT_STATUS",
  SEMESTER: "SEMESTER",
} as const;

export type EnumCategory = (typeof EnumCategory)[keyof typeof EnumCategory];

export interface EnumValueResponse {
  id: string;
  key: string;
  value: string;
}

export const enumBaseSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

export const createEnumSchema = enumBaseSchema;
export const updateEnumSchema = enumBaseSchema.partial();

export type CreateEnumPayload = z.infer<typeof createEnumSchema>;
export type UpdateEnumPayload = z.infer<typeof updateEnumSchema>;
