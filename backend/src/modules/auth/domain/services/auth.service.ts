import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
// import * as crypto from 'crypto';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { MailService } from 'src/modules/mail/domain/mail.service';
import { UserRepository } from '../../data/repository';
import { ForgetPassMailReq } from '../../presentation/dto/request/forget-password.dto';
import { LoginDto } from '../../presentation/dto/request/login.dto';
import { RegisterDto } from '../../presentation/dto/request/register.dto';
import { ResetPasswordDto } from '../../presentation/dto/request/reset-password.dto';

import { AppConfigService } from '../../data/services/app-config.service';
import { BcyptService } from '../../../../common/utils/bcypt/bcypt.service';
import { EnumService } from 'src/modules/enums/domain/service/enums.service';
import { JwtTokenService } from 'src/common/utils/jwt/jwt.service';
import { MessageResponseDto } from '../../presentation/dto/response/verify-email-message.response.dto';
import { RefreshTokenResponseDto } from '../../presentation/dto/response/refreshToken.response.dto';
import { CryptoService } from 'src/common/utils/crypto/crypto.service';
import { RESET_PASSWORD_TOKEN_EXPIRY } from 'src/common/constants/token.constants';
import { UserMapper } from '../../data/mappers/user.mapper';
import { AuthMapper } from '../../data/mappers/auth.mapper';
import { ENUM_TYPES } from 'src/common/constants/enum-types.constant';
import { ROLES } from 'src/common/constants/roles.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly usersRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly JwtTokenService: JwtTokenService,
    private readonly appConfigService: AppConfigService,
    private readonly bcryptService: BcyptService,
    private readonly enumService: EnumService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(ERRORMESSAGE.EMAIL_ALREADY_EXISTS);
    }
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);
    const role = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.ROLE,
      ROLES.STUDENT,
    );
    const newlyCreatedUser = await this.usersRepository.createAndSave({
      email: dto.email,
      password: hashedPassword,
      role: role,
    });

    return UserMapper.toResponseDto(newlyCreatedUser);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (
      !user ||
      !(await this.bcryptService.isPasswordValid(dto.password, user.password))
    ) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }

    const { accessToken, refreshToken } =
      this.JwtTokenService.generateToken(user);

    return AuthMapper.toAuthResponse(user, accessToken, refreshToken);
  }

  async refreshToken(refreshToken: string) {
    const payload = this.JwtTokenService.verifyRefreshToken(refreshToken);
    const user = await this.usersRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.INVALID_TOKEN);
    }
    const accessToken = this.JwtTokenService.generateAccessToken(user);

    return new RefreshTokenResponseDto({ accessToken });
  }

  // find the current user by id
  // only role extract perpose for jwt Strategy
  async getUserById(userId: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }
    return UserMapper.toResponseDto(user);
  }
  // send the mail with token for verify purpose
  async sendVerifyEmailLink(userId: number) {
    try {
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
      }
      const token = this.JwtTokenService.generateEmailVerificationToken(user);

      const verifyUrl = `${this.appConfigService.appUrl}/auth/verify-email?token=${token}`;

      await this.mailService.sendVerficationEmail(user.email, verifyUrl);
      return new MessageResponseDto(SUCCESSMSG.MAIL_SENT_SUCCESS);
    } catch (e) {
      throw new InternalServerErrorException(ERRORMESSAGE.MAIL_SERVER_ISSUE);
    }
  }
  // validate the email user
  async verifyEmail(token: string) {
    try {
      const payload = this.JwtTokenService.verifyEmailToken(token);

      const user = await this.usersRepository.findById(payload.sub);
      if (!user) {
        throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
      }
      if (user.isEmailVerified) {
        return new MessageResponseDto(SUCCESSMSG.VERIFIED_EMAIL);
      }
      user.isEmailVerified = true;
      await this.usersRepository.save(user);
      return new MessageResponseDto(SUCCESSMSG.VERIFIEDSUCCESSEMAIL);
    } catch (e) {
      throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
    }
  }

  async forgetPassword(dto: ForgetPassMailReq) {
    try {
      const user = await this.usersRepository.findByEmail(dto.email);
      if (user) {
        const { rawToken, tokenHash } = this.cryptoService.generateResetToken();
        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpires = new Date(
          Date.now() + RESET_PASSWORD_TOKEN_EXPIRY,
        ); //15min
        await this.usersRepository.save(user);
        const resetUrl = `${this.appConfigService.appUrl}/auth/reset-password?token=${rawToken}`;
        await this.mailService.sendResetPassword(user.email, resetUrl);
      }
      return new MessageResponseDto(SUCCESSMSG.IFEXISTTHENSENDMAIL);
    } catch (e) {
      console.error('Forget password error:', e);
      throw new InternalServerErrorException(ERRORMESSAGE.SERVER_ERROR);
    }
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(ERRORMESSAGE.PASSWORD_NOT_MATCHS);
    }
    const tokenHash = this.cryptoService.hashToken(token);

    const user = await this.usersRepository.findValidResetToken(tokenHash);
    if (!user) {
      throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
    }
    const newPasswordHash = await this.bcryptService.hashPassword(dto.password);
    user.password = newPasswordHash;
    user.resetPasswordExpires = null;
    user.resetPasswordToken = null;
    await this.usersRepository.save(user);
    return new MessageResponseDto(SUCCESSMSG.PASSWORD_RESET_SUCCESS);
  }
}
