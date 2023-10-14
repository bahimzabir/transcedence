interface TokenPayload {
  sub: number;
  email: string;
  isTowFactorAuthEnabled?: boolean;
}
export default TokenPayload;
