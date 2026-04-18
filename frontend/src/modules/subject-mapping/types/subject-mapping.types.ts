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
