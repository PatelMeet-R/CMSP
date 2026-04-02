import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { AuthService } from '../../domain/services/auth.service';
import { RegisterStudentDto } from '../dto/request/register.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { LoginDto } from '../dto/request/login.dto';
import { ForgetPassMailReq } from '../dto/request/forget-password.dto';
import { ResetPasswordDto } from '../dto/request/reset-password.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { Roles } from 'src/core/decorators/roles.decorators';
import { ROLES } from 'src/common/constants/roles.constant';
import { RegisterSpecificUserDto } from '../dto/request/register-specific-user.request.dto';
import { LoginThrottlerGuard } from 'src/core/guards/login-throttler.guard';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { VerificationEmailThrottlerGuard } from 'src/core/guards/verification-email-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterStudentDto) {
    return {
      message: SUCCESSMSG.AUTH.SIGNUP_SUCCESS,
      data: await this.authService.register(dto),
    };
  }
  @UseGuards(LoginThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return {
      message: SUCCESSMSG.AUTH.LOGIN_SUCCESS,
      data: await this.authService.login(dto),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return {
      message: 'tokens',
      data: await this.authService.refreshToken(refreshToken),
    };
  }

  @Post('send-verification-mail')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, VerificationEmailThrottlerGuard)
  async sendVerificationMail(@CurrentUser() user: UserResponseDto) {
    return await this.authService.sendVerifyEmailLink(user.id);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(@Body() dto: ForgetPassMailReq) {
    return await this.authService.forgetPassword(dto);
  }
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

  // protected Route
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  getProfile(@CurrentUser() user: UserResponseDto) {
    return { data: user };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('register/hod')
  async registerHod(
    @Body() dto: RegisterSpecificUserDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const RoleName = ROLES.HOD;
    const res = await this.authService.registerSpecificUser(
      dto,
      RoleName,
      user.id,
    );
    return {
      message: SUCCESSMSG.AUTH.REGISTERED,
      data: res,
    };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  @HttpCode(HttpStatus.CREATED)
  @Post('register/professor')
  async registerProfessor(
    @Body() dto: RegisterSpecificUserDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const RoleName = ROLES.PROFESSOR;
    const res = await this.authService.registerSpecificUser(
      dto,
      RoleName,
      user.id,
    );
    return {
      message: SUCCESSMSG.AUTH.REGISTERED,
      data: res,
    };
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async logout() {
    return { message: 'Logout successful' };
  }
}
