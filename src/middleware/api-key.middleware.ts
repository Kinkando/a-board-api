import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = process.env.API_KEY;
    const apiKeyReq = req.headers['x-api-key'];
    if (!apiKeyReq || apiKeyReq !== apiKey) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: 'api key is invalid' });
    }
    next();
  }
}
