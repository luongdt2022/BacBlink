import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard, but never rejects the request when no/invalid token is
 * present — it just leaves `request.user` unset. Use on public endpoints
 * that need to tailor their response when the caller happens to be logged in
 * (e.g. showing full detail to the owner, a restricted view to everyone else).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    _err: any,
    user: any,
    _info: any,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    return user;
  }
}
