export interface AssignSubjectPayload {
  professorId: string;
  subjectId: string;
  semesterId: string;
  academicYearId: string;
}

// Based on your Backend Staff Mapper
export interface StaffComboboxDTO {
  id: string;
  userId: string;
  fullName: string;
  roleKey: string | null;
  roleValue: string | null;
}

// Based on your Backend Subject Mapper
export interface SubjectComboboxDTO {
  id: string;
  name: string;
  code: string;
  semester: string | null;
  semesterId: string | null;
}

// Search Parameters
export interface SearchParams {
  limit: number;
  search?: string;
  semesterId?: string;
  branchId?: string;
  academicYearId?: string;
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
  id: string;
  createdAt: string;
  professor: {
    id?: string;
    name: string;
    email?: string;
    mobile?: string | null;
  };
  subject: {
    id?: string;
    code?: string;
    name?: string;
    branch?: string | null;
  };
  semester: string | null;
  academicYear: string | null;
  assignedBy: string;
}
