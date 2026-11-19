import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User, UserRole } from '../../users/user.entity';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = User>(
    err: unknown,
    user: User,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- base returns any, we need User for role check
    const result = super.handleRequest(
      err,
      user,
      info,
      context,
      status,
    ) as User;
    if (result?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return result as TUser;
  }
}
