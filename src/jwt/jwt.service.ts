import { Injectable } from '@nestjs/common';
import { sign, verify, decode } from 'jsonwebtoken';
import { v7 } from 'uuid';
import { Jwt } from '../@types/jwt.interface';

@Injectable()
export class JwtService {
  encodeJwt(userId: string) {
    const jwtKey = process.env.JWT_SECRET_KEY;
    const accessJWT: Jwt = {
      userId,
      type: 'access',
      sessionUid: v7(),
    };
    const refreshJWT: Jwt = {
      userId,
      type: 'refresh',
      sessionUid: v7(),
    };
    const accessToken = sign(accessJWT, jwtKey, {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_ACCESS_EXPIRED,
    });
    const refreshToken = sign(refreshJWT, jwtKey, {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_REFRESH_EXPIRED,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  decodeJwt(token: string) {
    verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });
    return decode(token) as Jwt;
  }
}
