export class AssignmentResponseDto {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  subjectName: string;
  branchName: string;
  semester: string;
  attachmentUrl?: string; // The Cloudinary link
  createdAt: Date;
  originalFilename: string;
  subjectId: string;
  branchId: string;
  semesterId: string;
  attachmentId: string;
  academicYearId: string;
}

export class AssignmentResponseArrayDto {
  id: string;
  title: string;
  dueDate: Date;
  subjectName: string;
  branchName: string;
  semester: string;
  attachmentUrl?: string;
  academicYearId: string;
  academicYear: string;
}
