import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Profile } from '../@types/user.interface';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new HttpException(
        { error: 'invalid access token' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const jwt = this.jwtService.decodeJwt(token);
      if (jwt.type !== 'access') {
        throw Error('jwt is not access token');
      }
      request.profile = { userId: jwt.userId } as Profile;
    } catch (error) {
      throw new HttpException({ error: `${error}` }, HttpStatus.UNAUTHORIZED);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
