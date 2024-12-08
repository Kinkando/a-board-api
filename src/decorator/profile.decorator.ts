import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Profile } from '../@types/user.interface';

export const ProfileDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.profile as Profile;
  },
);
