import { JwtPayload } from 'jsonwebtoken';

export interface Jwt extends JwtPayload {
  readonly userId: string;
  readonly sessionUid: string;
  readonly type: 'access' | 'refresh';
}
