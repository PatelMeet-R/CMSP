export class AssignmentResponseDto {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  subjectName: string;
  branchName: string;
  semester: string;
  attachmentUrl?: string; // The Cloudinary link
  createdAt: Date;
  originalFilename: string;
  subjectId: number;
  branchId: number;
  semesterId: number;
  attachmentId: number;
  academicYearId: number;
}

export class AssignmentResponseArrayDto {
  id: number;
  title: string;
  dueDate: Date;
  subjectName: string;
  branchName: string;
  semester: string;
  attachmentUrl?: string;
  academicYearId: number;
  academicYear: string;
}
