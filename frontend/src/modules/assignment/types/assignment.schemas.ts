import { z } from "zod";

export const assignmentFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  dueDate: z.date({ message: "Due date is required" }),
  subjectId: z.string({ message: "Subject is required" }),
  branchId: z.string({ message: "Branch is required" }),
  semesterId: z.string({ message: "Semester is required" }),
  academicYearId: z.string().optional().nullable(),
  attachmentId: z.string().optional().nullable(),
});

export interface AssignmentPayload {
  title: string;
  description: string;
  dueDate: string; // ISO String format
  subjectId: string;
  branchId: string;
  semesterId: string;
  academicYearId?: string | null;
  attachmentId?: string | null;
}

export interface AssignmentDTO {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subjectName: string;
  branchName: string;
  semester: string;
  attachmentUrl?: string | null;
  createdAt: string;
  createdBy?: string;
  subjectId: string;
  branchId: string;
  semesterId: string;
  academicYearId: string;
  attachmentId?: string | null;
  originalFilename?: string | null;
  academicYear?: string;
}

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
export type UpdateAssignmentPayload = Partial<AssignmentDTO>;
