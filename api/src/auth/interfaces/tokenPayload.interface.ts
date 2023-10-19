import { Type } from 'class-transformer';
class TokenPayload {
  sub: number;
  email: string;
  @Type(() => Boolean)
  isTwoFactorAuthEnabled: boolean;
}

export default TokenPayload;
