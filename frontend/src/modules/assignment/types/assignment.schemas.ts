import { z } from "zod";

export const assignmentFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  dueDate: z.date({ message: "Due date is required" }),
  subjectId: z.number({ message: "Subject is required" }),
  branchId: z.number({ message: "Branch is required" }),
  semesterId: z.number({ message: "Semester is required" }),
  academicYearId: z.number().optional().nullable(),
  attachmentId: z.number().optional().nullable(),
});

export interface AssignmentPayload {
  title: string;
  description: string;
  dueDate: string; // ISO String format
  subjectId: number;
  branchId: number;
  semesterId: number;
  academicYearId?: number | null;
  attachmentId?: number | null;
}

export interface AssignmentDTO {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  subjectName: string;
  branchName: string;
  semester: string;
  attachmentUrl?: string | null;
  createdAt: string;
  createdBy?: number;
  subjectId: number;
  branchId: number;
  semesterId: number;
  academicYearId: number;
  attachmentId?: number | null;
  originalFilename?: string | null;
  academicYear?: string;
}

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
export type UpdateAssignmentPayload = Partial<AssignmentDTO>;
