export interface StaffProfileResponse {
  id: string;
  userId: string;
  designation: string;
  officeLocation: string;
  joiningDate: string;
  maxSubjectWorkload?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface SubjectHistoryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  subject?: {
    id: string;
    code: string;
    name: string;
  };

  semester?: {
    id: string;
    key: string;
    value: string;
  };

  academicYear?: {
    id: string;
    key: string;
    value: string;
  };
}

export type ProfessorSubjectHistoryMap = Record<string, SubjectHistoryItem[]>;

export interface StaffProfessionalDetailsProps {
  staffProfile: StaffProfileResponse | undefined;
  historyMap: ProfessorSubjectHistoryMap | undefined;
  expandedYearKey: string | undefined;
  setExpandedYearKey: (val: string | undefined) => void;
}
export interface SubjectAssignmentData {
  id: string;
  subject?: { name: string; code: string };
  semester?: { value: string };
  deletedAt?: string | null;
}
