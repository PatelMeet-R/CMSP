import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
