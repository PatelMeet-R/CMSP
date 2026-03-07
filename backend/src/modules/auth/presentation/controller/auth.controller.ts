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
import { RegisterDto } from '../dto/request/register.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { LoginDto } from '../dto/request/login.dto';
import { ForgetPassMailReq } from '../dto/request/forget-password.dto';
import { ResetPasswordDto } from '../dto/request/reset-password.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('health')
  health() {
    return {
      message: ' auth controller working fine',
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return {
      message: SUCCESSMSG.SIGNUP_SUCCESS,
      data: await this.authService.register(dto),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return {
      message: SUCCESSMSG.LOGIN_SUCCESS,
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
  @UseGuards(JwtAuthGuard)
  async sendVerificationMail(@CurrentUser() user: any) {
    return await this.authService.sendVerifyEmailLink(user);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Post('forget-Password')
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
      throw new BadRequestException('Token missing');
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

  // create hod,Professors
  // @Post('register-hod')
  // @Roles(SUPER_ADMIN)
  // @UseGuards(JwtAuthGuard,RolesGuard)
  // registerHod(@Body() )
}
