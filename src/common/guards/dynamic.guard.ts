import { get, isEmpty } from 'lodash';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { SKIP_AUTH_KEY } from 'src/modules/auth/skip-auth.decorator';

@Injectable()
export class DynamicGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    // @InjectModel(GuestUserModel.name) private guestUserModel: Model<GuestUserModel>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        message: 'Unauthorized access, please provide a valid token.',
        reLogin: true,
      });
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      if (isEmpty(payload)) {
        throw new UnauthorizedException('Invalid token. Please relogin and retry');
      }
      if (path.startsWith('/admin')) {
        if (get(payload, 'userTypeId.slug') === 'super-admin') {
          request.user = payload;
          return true;
        } else {
          throw new UnauthorizedException({
            message: 'You have no pemission. Please re log in again.',
            reLogin: true,
          });
        }
      } else {
        request.user = payload;
        return true;
      }
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          message: 'Token expired. Please log in again.',
          reLogin: true,
        });
      } else if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException({
          message: 'Invalid token signature. Please log in again.',
          reLogin: true,
        });
      } else {
        // console.log('err', err);
        throw new UnauthorizedException(err);
      }
    }
    return false;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = (request.headers.authorization || '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
