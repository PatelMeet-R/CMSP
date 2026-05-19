// import { Inject, Injectable } from '@nestjs/common';
// import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
// import * as streamifier from 'streamifier';

// @Injectable()
// export class CloudinaryService {
//   constructor(
//     @Inject('CLOUDINARY')
//     private readonly cloudinary: typeof v2,
//   ) {}

//   uploadFile(
//     file: Express.Multer.File,
//     folder: string = 'assignment',
//   ): Promise<UploadApiResponse> {
//     return new Promise<UploadApiResponse>((resolve, reject) => {
//       const uploadStream = this.cloudinary.uploader.upload_stream(
//         {
//           folder: folder,
//           resource_type: 'auto',
//           use_filename: true,
//           unique_filename: true,
//         },
//         (
//           error: UploadApiErrorResponse | undefined,
//           result: UploadApiResponse | undefined,
//         ) => {
//           if (error || !result)
//             return reject(error || new Error('Upload failed'));
//           resolve(result);
//         },
//       );
//       streamifier.createReadStream(file.buffer).pipe(uploadStream);

//       //convert the file buffer to a readable stream and pipe to the upload stream
//     });
//   }

//   async deleteFile(publicId: string): Promise<any> {
//     return this.cloudinary.uploader.destroy(publicId);
//   }
// }
import { Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof v2,
  ) {}

  uploadFile(
    file: Express.Multer.File,
    folder: string = 'assignment',
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      
      // 🚀 NEW ADDITION 1: EXTRACT THE EXTENSION
      // When Multer holds a file in memory, it's just raw data. 
      // We must grab the original extension (e.g., 'pdf', 'docx') from the file name.
      // Example: 'math_homework.pdf' -> splits into ['math_homework', 'pdf'] -> pops 'pdf'
      const fileExtension = file.originalname.split('.').pop();

      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto', // Tells Cloudinary not to strictly force it as an 'image'
          
          // 🚀 NEW ADDITION 2: FORCE THE FORMAT
          // Because we are piping a raw data stream, Cloudinary drops the file extension by default.
          // By explicitly passing the `format` property, Cloudinary appends `.pdf` or `.docx` 
          // to the final URL, allowing browsers to render previews correctly.
          format: fileExtension, 
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result)
            return reject(error || new Error('Upload failed'));
          resolve(result);
        },
      );
      
      // Convert the file buffer to a readable stream and pipe to the upload stream
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return this.cloudinary.uploader.destroy(publicId);
  }
}