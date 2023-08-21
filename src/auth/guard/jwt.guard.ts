import { AuthGuard } from '@nestjs/passport';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

export class JwtGard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}



@Injectable()
export class WsGuard implements CanActivate {

  constructor(config: ConfigService, private prisma: PrismaService) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToWs();
    const data = request.getClient<Socket>();
    const cookies = data.handshake.headers.cookie;
    if (cookies) {
      const token = cookies.split("=")[1];
      return this.validateRequest(token);
    }
    throw new WsException('cookies not sent');
  }
  async validateRequest(request: any): Promise<any> {
    return true;
  }

}
