interface TokenPayload {
  sub: number;
  email: string;
  isTwoFactorAuthEnabled?: boolean;
}
export default TokenPayload;
