import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  AssignSubjectPayload,
  PaginatedResponse,
  StaffComboboxDTO,
  StandardResponse,
  SearchParams,
  SubjectComboboxDTO,
} from "@/modules/subject-mapping/types/subject-mapping.types";
import type { AxiosError } from "axios";

const extractItems = <T>(response: {
  data?: { items?: T[]; data?: { items?: T[] } };
  items?: T[];
}): T[] => {
  return (
    response.data?.items || response.data?.data?.items || response.items || []
  );
};

// 1  Search Staff (Professors & HODs) via Personal Info Route
export const searchStaff = async (searchTerm: string, branchId?: number) => {
  const params: SearchParams = { limit: 15 };
  if (searchTerm && searchTerm.trim() !== "") params.search = searchTerm.trim();

  if (branchId) params.branchId = branchId;

  try {
    const response = await axiosInstance.get<
      StandardResponse<StaffComboboxDTO[]>
    >(API_ENDPOINT.STAFF.SEARCH_STAFF, {
      params,
    });
    const allUsers = response.data?.data || [];

    return allUsers.map((profile) => ({
      value: profile.userId,
      label: profile.fullName,
      rawData: profile,
    }));
  } catch (error: unknown) {
    const err = error as AxiosError;
    console.error(` [SERVICE: Staff] ERROR:`, err.message);
    return [];
  }
};
// 2. Search Subjects (with optional Semester filter)
export const searchSubjects = async (
  searchTerm: string,
  semesterId?: number,
  branchId?: number,
) => {
  const params: SearchParams = { limit: 10 };
  if (searchTerm && searchTerm.trim() !== "") params.search = searchTerm.trim();
  if (semesterId) params.semesterId = semesterId;

  //  Pass branchId if selected
  if (branchId) params.branchId = branchId;

  try {
    const response = await axiosInstance.get<
      StandardResponse<SubjectComboboxDTO[]>
    >(API_ENDPOINT.STAFF.SEARCH_SUBJECT, {
      params,
    });
    const allSubjects = response.data?.data || [];

    return allSubjects.map((subject) => ({
      value: subject.id,
      label: subject.name,
      subLabel: `${subject.code}`,
      rawData: subject,
    }));
  } catch (error: unknown) {
    const err = error as AxiosError;
    console.error(` [SERVICE: Subject] ERROR:`, err.message);
    return [];
  }
};

// 3. Assign Subject
export const assignSubjectToProfessor = async (data: AssignSubjectPayload) => {
  const response = await axiosInstance.post(API_ENDPOINT.SUBJECT.ASSIGN, data);
  return response.data;
};

// 4. Unassign Subject
export const unassignSubject = async (mappingId: number) => {
  const response = await axiosInstance.delete(
    API_ENDPOINT.SUBJECT.UNASSIGN(mappingId),
  );
  return response.data;
};

// 5. Get Active Assignments for the Table
export const fetchActiveAssignments = async (params: SearchParams) => {
  const response = await axiosInstance.get<PaginatedResponse<unknown>>(
    API_ENDPOINT.SUBJECT.VIEW_PROFESSOR_SUBJECT,
    { params },
  );
  return extractItems(response) || response.data.data;
};
