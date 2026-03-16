import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { MailService } from 'src/modules/mail/domain/mail.service';
import { AuthRepository } from '../../data/repository';
import { ForgetPassMailReq } from '../../presentation/dto/request/forget-password.dto';
import { LoginDto } from '../../presentation/dto/request/login.dto';
import { RegisterStudentDto } from '../../presentation/dto/request/register.dto';
import { ResetPasswordDto } from '../../presentation/dto/request/reset-password.dto';

import { AppConfigService } from '../../data/services/app-config.service';
import { BcyptService } from '../../../../common/utils/bcypt/bcypt.service';
import { JwtTokenService } from 'src/common/utils/jwt/jwt.service';
import { MessageResponseDto } from '../../presentation/dto/response/verify-email-message.response.dto';
import { RefreshTokenResponseDto } from '../../presentation/dto/response/refreshToken.response.dto';
import { CryptoService } from 'src/common/utils/crypto/crypto.service';
import { RESET_PASSWORD_TOKEN_EXPIRY } from 'src/common/constants/token.constants';
import { UserMapper } from '../../data/mappers/user.response.mapper';
import { AuthMapper } from '../../data/mappers/auth.mapper';
import { ENUM_TYPES } from 'src/common/constants/enum-types.constant';
import { ROLES } from 'src/common/constants/roles.constant';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { EmailedUserResponse } from '../../data/mappers/emailed-user.response.mapper';
import { BranchService } from 'src/modules/branch/domain/branch.service';
import { RegisterSpecificUserDto } from '../../presentation/dto/request/register-specific-user.request.dto';
import { UserRegisterMapper } from '../../data/mappers/user-register.mapper';
import { RegisterSpecificUserMapper } from '../../data/mappers/register-specific-user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly authRepository: AuthRepository,
    private readonly mailService: MailService,
    private readonly JwtTokenService: JwtTokenService,
    private readonly appConfigService: AppConfigService,
    private readonly bcryptService: BcyptService,
    private readonly enumService: EnumService,
    private readonly branchService: BranchService,
  ) {}

  async register(dto: RegisterStudentDto) {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(ERRORMESSAGE.EMAIL_ALREADY_EXISTS);
    }
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);
    const role = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.ROLE,
      ROLES.STUDENT,
    );
    if (!role) {
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('role'));
    }
    const branch = await this.branchService.getBranchEntityById(dto.branchId);
    if (!branch) {
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('branch'));
    }
    const entity = UserRegisterMapper.toRegisterStudentEntity(
      dto,
      hashedPassword,
      role,
      branch,
    );

    const newlyCreatedUser = await this.authRepository.save(entity);
    entity.createdBy = newlyCreatedUser.id;
    const saved = await this.authRepository.save(entity);
    return UserMapper.toResponseDto(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findByEmail(dto.email);
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
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.INVALID_TOKEN);
    }
    const accessToken = this.JwtTokenService.generateAccessToken(user);

    return new RefreshTokenResponseDto({ accessToken });
  }
  async getUserByIdWithPersonalInfo(userId: number) {
    const user =
      await this.authRepository.findByIdWithPersonalInfoRelation(userId);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }
    return user;
  }
  // find the current user by id
  // only role extract purpose for jwt Strategy
  async getUserById(userId: number) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }
    return user;
  }
  // send the mail with token for verify purpose
  async sendVerifyEmailLink(userId: number) {
    try {
      const user = await this.authRepository.findById(userId);

      if (!user) {
        throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
      }
      const token = this.JwtTokenService.generateEmailVerificationToken(user);

      const verifyUrl = `${this.appConfigService.appUrl}/auth/verify-email?token=${token}`;

      await this.mailService.sendVerificationEmail(user.email, verifyUrl);
      return new MessageResponseDto(SUCCESSMSG.AUTH.VERIFICATION_EMAIL_SENT);
    } catch (e) {
      throw new InternalServerErrorException(ERRORMESSAGE.MAIL_SERVER_ISSUE);
    }
  }
  // validate the email user
  async verifyEmail(token: string) {
    try {
      const payload = this.JwtTokenService.verifyEmailToken(token);

      const user = await this.authRepository.findById(payload.sub);
      if (!user) {
        throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
      }
      if (user.isEmailVerified) {
        return new MessageResponseDto(SUCCESSMSG.AUTH.EMAIL_ALREADY_VERIFIED);
      }
      user.isEmailVerified = true;
      await this.authRepository.save(user);
      return new MessageResponseDto(SUCCESSMSG.AUTH.EMAIL_VERIFIED_SUCCESS);
    } catch (e) {
      throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
    }
  }

  async forgetPassword(dto: ForgetPassMailReq) {
    try {
      const user = await this.authRepository.findByEmail(dto.email);
      if (user) {
        const { rawToken, tokenHash } = this.cryptoService.generateResetToken();
        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpires = new Date(
          Date.now() + RESET_PASSWORD_TOKEN_EXPIRY,
        ); //15min
        await this.authRepository.save(user);
        const resetUrl = `${this.appConfigService.appUrl}/auth/reset-password?token=${rawToken}`;
        await this.mailService.sendResetPassword(user.email, resetUrl);
      }
      return new MessageResponseDto(
        SUCCESSMSG.AUTH.RESET_LINK_IF_ACCOUNT_EXISTS,
      );
    } catch (e) {
      console.error('Forget password error:', e);
      throw new InternalServerErrorException(ERRORMESSAGE.SERVER_ERROR);
    }
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(ERRORMESSAGE.PASSWORD_NOT_MATCHES);
    }
    const tokenHash = this.cryptoService.hashToken(token);

    const user = await this.authRepository.findValidResetToken(tokenHash);
    if (!user) {
      throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
    }
    const newPasswordHash = await this.bcryptService.hashPassword(dto.password);
    user.password = newPasswordHash;
    user.resetPasswordExpires = null;
    user.resetPasswordToken = null;
    await this.authRepository.save(user);
    return new MessageResponseDto(SUCCESSMSG.AUTH.PASSWORD_RESET_SUCCESS);
  }

  async registerSpecificUser(
    dto: RegisterSpecificUserDto,
    roleName: string,
    createdBy: number,
  ) {
    try {
      const existingUser = await this.authRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException(ERRORMESSAGE.EMAIL_ALREADY_EXISTS);
      }
      const creator =
        await this.authRepository.findByIdWithPersonalInfoRelation(createdBy);
      if (!creator) {
        throw new UnauthorizedException(ERRORMESSAGE.INSUFFICIENT_PERMISSION);
      }
      const branch = await this.branchService.getBranchEntityById(dto.branchId);
      if (!branch) {
        throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('branch'));
      }

      const password = this.cryptoService.generateRandomPassword();
      const hashedPassword = await this.bcryptService.hashPassword(password);
      const role = await this.enumService.getMeEnumValueIfExist(
        ENUM_TYPES.ROLE,
        roleName,
      );
      if (!role) {
        throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('role'));
      }

      const entity = RegisterSpecificUserMapper.toRegisterEntity(
        dto,
        hashedPassword,
        role,
        createdBy,
        branch,
      );
      const newlyCreatedUser = await this.authRepository.save(entity);
      const RequiredEntity = EmailedUserResponse.toResponseDto(
        newlyCreatedUser,
        password,
        creator,
      );

      await this.mailService.sendRegisterUserInfo(
        newlyCreatedUser.email,
        RequiredEntity,
      );
      return new MessageResponseDto(SUCCESSMSG.AUTH.REGISTERED);
    } catch (e) {
      throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
    }
  }
}
