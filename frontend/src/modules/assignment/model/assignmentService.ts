import axiosInstance from "@/core/api/axiosInstance";
import { API_ENDPOINT } from "@/core/api/endPoint";
import type {
  AssignmentDTO,
  AssignmentPayload,
  UpdateAssignmentPayload,
} from "@/modules/assignment/types/assignment.schemas";
import type {
  PaginatedResponse,
  SearchParams,
} from "@/lib/interface/pagination.interface";

// 1. File Upload (multipart/form-data)
export const uploadAssignmentFile = async (
  file: File,
  folder: string = "assignments",
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await axiosInstance.post(
    API_ENDPOINT.FILE.UPLOAD,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  //  { data: FileResponseDto }
  return response.data.data;
};

// 2. Create Assignment
export const createAssignment = async (payload: AssignmentPayload) => {
  const response = await axiosInstance.post(
    API_ENDPOINT.ASSIGNMENT.ADD,
    payload,
  );
  return response.data;
};

// 3. Get All Assignments (For Super Admin / HOD)
export const fetchAllAssignments = async (
  params: SearchParams,
): Promise<PaginatedResponse<AssignmentDTO>> => {
  // We tell Axios to expect the data wrapped in your standard { data: { items, meta } } format
  const response = await axiosInstance.get<{
    data: PaginatedResponse<AssignmentDTO>;
  }>(API_ENDPOINT.ASSIGNMENT.LIST, { params });

  return response.data.data;
};

// 4. Delete Assignment
export const deleteAssignment = async (assignmentId: number) => {
  const response = await axiosInstance.delete(
    API_ENDPOINT.ASSIGNMENT.DELETE(assignmentId),
  );
  return response.data;
};

export const fetchAssignmentById = async (
  assignmentId: number,
): Promise<AssignmentDTO> => {
  const response = await axiosInstance.get<{ data: AssignmentDTO }>(
    API_ENDPOINT.ASSIGNMENT.VIEW(assignmentId),
  );

  return response.data.data;
};

export const updateAssignment = async (
  assignmentId: number,
  payload: UpdateAssignmentPayload,
) => {
  const response = await axiosInstance.patch(
    API_ENDPOINT.ASSIGNMENT.UPDATE(assignmentId),
    payload,
  );
  return response.data;
};

export const deleteUploadedFile = async (fileId: number) => {
  const response = await axiosInstance.delete(API_ENDPOINT.FILE.DELETE(fileId));
  return response.data;
};
