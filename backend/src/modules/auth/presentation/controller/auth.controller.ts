import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { AuthService } from '../../domain/services/auth.service';
import { RegisterStudentDto } from '../dto/request/register.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { LoginDto } from '../dto/request/login.dto';
import { ForgetPassMailReq } from '../dto/request/forget-password.dto';
import { ResetPasswordDto } from '../dto/request/reset-password.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { RegisterSpecificUserDto } from '../dto/request/register-specific-user.request.dto';
import { LoginThrottlerGuard } from 'src/core/guards/login-throttler.guard';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { VerificationEmailThrottlerGuard } from 'src/core/guards/verification-email-throttler.guard';
import { Public } from 'src/core/decorators/public.decorator';
import { AllowInactive } from 'src/core/decorators/allow-inactive.decorator';
import express from 'express';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @AllowInactive()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterStudentDto) {
    return {
      message: SUCCESSMSG.AUTH.SIGNUP_SUCCESS,
      data: await this.authService.register(dto),
    };
  }
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() currentUser: any) {
    // We only need the ID from the token payload to fetch the absolute latest data
    const latestUserProfile = await this.authService.getHydratedUser(
      currentUser.id,
    );

    return {
      message: 'User profile retrieved successfully',
      data: latestUserProfile,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottlerGuard)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.authService.login(dto);

    //  Set Access Token Cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    //  Set Refresh Token Cookie (Scoped to refresh route for security)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth/refresh',
    });

    return {
      message: 'Login successful',
      data: result.user,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const tokenFromCookie = req.cookies?.refreshToken;

    if (!tokenFromCookie) {
      throw new UnauthorizedException('Session expired. Please login again.');
    }

    const result = await this.authService.refreshToken(tokenFromCookie);

    //  Rotate the cookies (Set new ones)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/', // everywhere
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth/refresh', //  Browser only sends it back to THIS route
    });

    // Note: If you rotate the refresh token too, set it here with path: '/api/v1/auth/refresh'

    return {
      message: 'Session extended successfully',
      data: result.user,
    };
  }

  @AllowInactive()
  @Post('send-verification-mail')
  @UseGuards(VerificationEmailThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async sendVerificationMail(@CurrentUser() user: UserResponseDto) {
    return await this.authService.sendVerifyEmailLink(user.id);
  }

  @Public()
  @AllowInactive()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Public()
  @AllowInactive()
  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(@Body() dto: ForgetPassMailReq) {
    return await this.authService.forgetPassword(dto);
  }

  @Public()
  @AllowInactive()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Query('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    if (!token) {
      throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
    }
    return await this.authService.resetPassword(token, dto);
  }

  @Permissions('auth:register-staff')
  @HttpCode(HttpStatus.CREATED)
  @Post('register/staff')
  async registerStaff(
    @Body() dto: RegisterSpecificUserDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.authService.registerSpecificUser(dto, user);
    return {
      message: SUCCESSMSG.AUTH.REGISTERED,
      data: res,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: express.Response) {
    //  Clear cookies on logout
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    return { message: 'Logged out successfully' };
  }
}
