import { z } from "zod";
//Dropdown Response
export interface BranchResponse {
  id: string;
  name: string;
}

export interface SemesterResponse {
  id: string;
  value: string;
}
//  ZOD
// src/modules/subject/types/subject.schemas.ts

// Base schema mimicking your backend validation
export const subjectBaseSchema = z.object({
  semesterId: z.string({ message: "Semester is required" }),
  branchId: z.string({ message: "Branch is required" }),
  name: z
    .string({ message: "Name is required" })
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),
  code: z
    .string({ message: "Code is required" })
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters"),
});

//  Create Schema
export const createSubjectSchema = subjectBaseSchema;

//  Update Schema
export const updateSubjectSchema = subjectBaseSchema.partial();

//   Types
export type CreateSubjectPayload = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectPayload = z.infer<typeof updateSubjectSchema>;

//  Response Type
export interface Subject {
  id: string;
  code: string;
  name: string;
  branch: string | null;
  semester: string | null;
  createdAt: string;
}

export interface SubjectDetails {
  id: string;
  code: string;
  name: string;
  branch: { id: string; name: string; code: string } | null;
  semester: { id: string; key: string; value: string } | null;
  createdAt?: string;
  updatedAt?: string;
}
