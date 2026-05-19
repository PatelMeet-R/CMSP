import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserMapper } from 'src/modules/auth/data/mappers/user.response.mapper';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // return UserMapper.toResponseDto(request.user);
    // return request.user;
    return request.user as UserResponseDto;
  },
);
