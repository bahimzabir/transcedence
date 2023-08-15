import { AuthGuard } from '@nestjs/passport';

export class JwtGard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
