interface TokenPayload {
  id: number;
  email: string;
  isTowFactorAuthEnabled?: boolean;
}
export default TokenPayload;
