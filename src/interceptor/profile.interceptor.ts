import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Profile } from '../@types/user.interface';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class ProfileInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    try {
      const token = this.extractTokenFromHeader(request);
      if (token) {
        const jwt = this.jwtService.decodeJwt(token);
        if (jwt.type === 'access') {
          request.profile = { userId: jwt.userId } as Profile;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}
    return next.handle();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
