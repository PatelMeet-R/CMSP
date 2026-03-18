import { registerAs } from '@nestjs/config';
export interface CloudinaryInterface {
  cloudName: string;
  apiKey: number;
  apiSecret: string;
}

export default registerAs('cloudinary', () => {
  const key = process.env.CLOUDINARY_API_KEY;
  if (!key) {
    throw new Error('CLOUDINARY_API_KEY is missing');
  }

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: parseInt(key),
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
});
