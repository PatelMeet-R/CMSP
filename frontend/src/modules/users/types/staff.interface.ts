export interface StaffProfileData {
  designation?: string;
  officeLocation?: string;
  joiningDate?: string | Date;
}
export interface SubjectAssignmentData {
  id: string;
  subject?: { name: string; code: string };
  semester?: { value: string };
  deletedAt?: string | null;
}

export interface StaffProfessionalDetailsProps {
  staffProfile: StaffProfileData;
  historyMap: Record<string, SubjectAssignmentData[]>;
  expandedYearKey: string | undefined;
  setExpandedYearKey: (key: string | undefined) => void;
}
