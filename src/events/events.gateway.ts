import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

const sockerConfig = {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5501', 'http://localhost:5501'],
    credentials: true,
  },
  namespace: 'user',
};


const validateUser = async (config: ConfigService, prisma: PrismaService, status: boolean, token?: string, id?: number,) => {
  let userID = id ? id : null
  if (!userID) {
    const payload: any = await jwt.verify(token, config.get('JWT_SECRET'));
    userID = payload.sub;
  }
  try {
    const user = await prisma.user.update({
      where: {
        id: userID,
      },
      data: {
        online: status,
      },
    })
    if (user) {
      delete user.token;
      delete user.password;
      delete user.email;
    }
    return user.id;
  } catch (error) {
    return null;
  }
}

@WebSocketGateway(sockerConfig)
export class EventsGateway {

  constructor(private prisma: PrismaService, private config: ConfigService,) { }
  @WebSocketServer()
  server: Server;
  onlineUsers = new Map<number, string[]>();

  async handleConnection(client: Socket): Promise<void> {
    const cookies = await client.handshake.headers.cookie;
    if (cookies) {
      const token = client.handshake.headers.cookie.split("=")[1];
      const userID = await validateUser(this.config, this.prisma, true, token);
      if (this.onlineUsers.has(userID)) {
        this.onlineUsers.get(userID).push(client.id);
      } else {
        this.onlineUsers.set(userID, [client.id]);
      }
    }

  }

  async handleDisconnect(client: Socket): Promise<void> {
    const token = client.handshake.headers.cookie.split("=")[1];
    const userID = await validateUser(this.config, this.prisma, true, token, null);
    const sockets = this.onlineUsers.get(userID);
    const index = sockets.indexOf(client.id);
    if (index > -1) {
      sockets.splice(index, 1);
    }
    if (sockets.length === 0) {
      this.onlineUsers.delete(userID);
      await validateUser(this.config, this.prisma, false, null, userID);
    } else {
      this.onlineUsers.set(userID, sockets);
    }
  }
}
