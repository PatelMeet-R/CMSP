import { InjectDataSource } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
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
import { BcyptService } from '../../../../common/utils/bcypt/bcypt.service';
import { JwtTokenService } from 'src/common/utils/jwt/jwt.service';
import { MessageResponseDto } from '../../presentation/dto/response/verify-email-message.response.dto';
import { RefreshTokenResponseDto } from '../../presentation/dto/response/refreshToken.response.dto';
import { CryptoService } from 'src/common/utils/crypto/crypto.service';
import { RESET_PASSWORD_TOKEN_EXPIRY } from 'src/common/constants/token.constants';
import { UserMapper } from '../../data/mappers/user.response.mapper';
import {
  ENUM_TYPES,
  ENUM_VALUES,
} from 'src/common/constants/enum-types.constant';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { EmailedUserResponse } from '../../data/mappers/emailed-user.response.mapper';
import { BranchService } from 'src/modules/branch/domain/branch.service';
import { RegisterSpecificUserDto } from '../../presentation/dto/request/register-specific-user.request.dto';
import { UserRegisterMapper } from '../../data/mappers/user-register.mapper';
import { RegisterSpecificUserMapper } from '../../data/mappers/register-specific-user.mapper';
import type { App } from 'src/config/app.config';
import { PersonalInfoRepository } from 'src/modules/users/data/repository/personal-info-repository';
import { DataSource } from 'typeorm';
import { PermissionComputeService } from 'src/modules/rbac/domain/services/permission-compute.service';
import { RoleService } from 'src/modules/rbac/domain/services/role.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('APP_CONFIG') private readonly appConfig: App,
    private readonly cryptoService: CryptoService,
    private readonly authRepository: AuthRepository,
    @Inject(forwardRef(() => PersonalInfoRepository))
    private readonly personalInfoRespository: PersonalInfoRepository,
    private readonly mailService: MailService,
    private readonly JwtTokenService: JwtTokenService,
    private readonly bcryptService: BcyptService,
    private readonly enumService: EnumService,
    private readonly branchService: BranchService,
    private readonly permissionComputeService: PermissionComputeService,
    private readonly roleService: RoleService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}
  // =====================================

  async register(dto: RegisterStudentDto) {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(ERRORMESSAGE.EMAIL_ALREADY_EXISTS);
    }
    const pendingRole =
      await this.roleService.findEntityByRoleName('PENDING_USER');
    if (!pendingRole) {
      throw new InternalServerErrorException(
        'Default registration role not found. Please run seeds.',
      );
    }
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);
    const userAccountStatus = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.USER_ACC_STATUS,
      ENUM_VALUES.USER_ACC_STATUS.PENDING_USER,
    );
    if (!userAccountStatus) {
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('Enum Value'));
    }
    const branch = await this.branchService.getBranchEntityById(dto.branchId);
    if (!branch) {
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('branch'));
    }
    const isEnrollmentNumbertaken =
      await this.personalInfoRespository.isUserExistWithEnrollment(
        dto.enrollmentNumber,
      );

    if (isEnrollmentNumbertaken) {
      throw new ConflictException(ERRORMESSAGE.ENROLLMENT_TAKEN);
    }
    const entity = UserRegisterMapper.toRegisterStudentEntity(
      dto,
      hashedPassword,
      pendingRole,
      userAccountStatus,
      branch,
    );

    const newlyCreatedUser = await this.authRepository.save(entity);
    entity.createdBy = newlyCreatedUser.id;
    const saved = await this.authRepository.save(entity);
    return UserMapper.toResponseDto(saved);
  }
  // =====================================

  async login(dto: LoginDto) {
    const user = await this.authRepository.findByEmail(dto.email);
    if (
      !user ||
      !(await this.bcryptService.isPasswordValid(dto.password, user.password))
    ) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }

    const effectivePermissions =
      await this.permissionComputeService.getEffectivePermissions(user.id);
    const permissionSlugs = Array.from(effectivePermissions);
    const userResponse = UserMapper.toResponseDto(user, permissionSlugs);
    const { accessToken, refreshToken } =
      this.JwtTokenService.generateToken(user);

    return { user: userResponse, accessToken, refreshToken };
  }
  // =====================================

  async refreshToken(refreshToken: string) {
    const payload = this.JwtTokenService.verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.INVALID_TOKEN);
    }
    const accessToken = this.JwtTokenService.generateAccessToken(user);

    return new RefreshTokenResponseDto({ accessToken });
  }
  // =====================================

  async getUserByIdWithPersonalInfo(userId: string) {
    const user =
      await this.authRepository.findByIdWithPersonalInfoRelation(userId);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }
    return user;
  }
  // =====================================
  // find the current user by id
  // only role extract purpose for jwt Strategy
  async findUserEntityById(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }
    return user;
  }
  // send the mail with token for verify purpose
  // =====================================

  async sendVerifyEmailLink(userId: string) {
    try {
      const user = await this.authRepository.findById(userId);

      if (!user) {
        throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
      }
      const token = this.JwtTokenService.generateEmailVerificationToken(user);

      const verifyUrl = `${this.appConfig.frontendUrl}/verify-email?token=${token}`;

      await this.mailService.sendVerificationEmail(user.email, verifyUrl);
      return new MessageResponseDto(SUCCESSMSG.AUTH.VERIFICATION_EMAIL_SENT);
    } catch (e) {
      throw new InternalServerErrorException(ERRORMESSAGE.MAIL_SERVER_ISSUE);
    }
  }
  // =====================================

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

      await this.authRepository.update(user.id, {
        isEmailVerified: true,
      });

      return new MessageResponseDto(SUCCESSMSG.AUTH.EMAIL_VERIFIED_SUCCESS);
    } catch (e) {
      throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
    }
  }

  // =====================================

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
        const resetUrl = `${this.appConfig.frontendUrl}/reset-password?token=${rawToken}`;
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
  // =====================================

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
  // =====================================

  async registerSpecificUser(dto: RegisterSpecificUserDto, creatorDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.authRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException(ERRORMESSAGE.EMAIL_ALREADY_EXISTS);
      }
      const creator =
        await this.authRepository.findByIdWithPersonalInfoRelation(
          creatorDto.id,
        );

      const branch = await this.branchService.getBranchEntityById(dto.branchId);

      const roleToAssign = await this.roleService.findEntityByRoleId(
        dto.roleId,
      );

      const userAccountStatus = await this.enumService.getMeEnumValueIfExist(
        ENUM_TYPES.USER_ACC_STATUS,
        ENUM_VALUES.USER_ACC_STATUS.ACTIVE,
      );

      if (!branch || !roleToAssign || !creator || !userAccountStatus)
        throw new NotFoundException('Required data not found');

      if (creator.personalInfo?.branch?.id) {
        dto.branchId = String(creator.personalInfo.branch.id);
      }

      const password = this.cryptoService.generateRandomPassword();
      const hashedPassword = await this.bcryptService.hashPassword(password);

      const entity = RegisterSpecificUserMapper.toRegisterEntity(
        dto,
        hashedPassword,
        roleToAssign,
        userAccountStatus,
        creator.id,
        branch,
      );
      entity.mustChangePassword = true;

      const newlyCreatedUser = await queryRunner.manager.save(entity);

      const emailData = EmailedUserResponse.toResponseDto(
        newlyCreatedUser,
        password,
        creator,
      );

      await this.mailService.sendRegisterUserInfo(
        newlyCreatedUser.email,
        emailData,
      );
      await queryRunner.commitTransaction();

      return {
        ...emailData,
        id: newlyCreatedUser.id,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      // throw new BadRequestException(ERRORMESSAGE.INVALID_TOKEN);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
  // =====================================
}
