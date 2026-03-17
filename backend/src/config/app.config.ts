import { registerAs } from '@nestjs/config';
export interface App {
  frontendUrl: string;
}

export default registerAs('app', () => ({
  frontendUrl: process.env.FRONTEND_URL,
}));
