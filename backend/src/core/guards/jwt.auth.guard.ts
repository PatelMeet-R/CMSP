import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// protects routes that requires authetication --> protected routes

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
