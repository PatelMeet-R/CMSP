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
}
