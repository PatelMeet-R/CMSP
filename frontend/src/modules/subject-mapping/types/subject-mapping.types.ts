export interface AssignSubjectPayload {
  professorId: number;
  subjectId: number;
  semesterId: number;
  academicYearId: number;
}

// Based on your Backend Staff Mapper
export interface StaffComboboxDTO {
  id: number;
  userId: number;
  fullName: string;
  roleKey: string | null;
  roleValue: string | null;
}

// Based on your Backend Subject Mapper
export interface SubjectComboboxDTO {
  id: number;
  name: string;
  code: string;
  semester: string | null;
  semesterId: number | null;
}

// Search Parameters
export interface SearchParams {
  limit: number;
  search?: string;
  semesterId?: number;
  branchId?: number;
  academicYearId?: number;
  page?: number;
}

export interface StandardResponse<T> {
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data?: {
    items?: T[];
  };
  items?: T[];
}

export interface ActiveAssignmentTableResponse {
  id: number;
  createdAt: string;
  professor: {
    id?: number;
    name: string;
    email?: string;
    mobile?: string | null;
  };
  subject: {
    id?: number;
    code?: string;
    name?: string;
    branch?: string | null;
  };
  semester: string | null;
  academicYear: string | null;
  assignedBy: string;
}
