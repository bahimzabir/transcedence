import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Global, Injectable } from '@nestjs/common';

const socketConfig = {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5501', 'http://localhost:5501', 'http://localhost:5173'],
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

@Injectable()
@WebSocketGateway(socketConfig)
export class EventsGateway {

  @WebSocketServer()
  server: Server;
  onlineUsers = new Map<number, string[]>();
  validateUser = validateUser;
  constructor(private prisma: PrismaService, private config: ConfigService) { }

  async handleConnection(client: Socket): Promise<void> {
    try {
      console.log("hendiling connection")
      const cookies = await client.handshake.headers.cookie;
      if (cookies) {
        const token = client.handshake.headers.cookie.split("=")[1];
        const userID = await this.validateUser(this.config, this.prisma, true, token);
        if (this.onlineUsers.has(userID)) {
          this.onlineUsers.get(userID).push(client.id);
        } else {
          this.onlineUsers.set(userID, [client.id]);
        }
      }
      console.log(this.onlineUsers);
    } catch {
      console.log("handleConnection error")
    }
    //console.log("handle connected users", this.onlineUsers)

  }

  async handleDisconnect(client: Socket): Promise<void> {
    try {
      const cookies = await client.handshake.headers.cookie;
      if (cookies) {
        const token = cookies.split("=")[1];
        const userID = await this.validateUser(this.config, this.prisma, true, token, null);
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
        console.log("hendiling disconnection")
      }
    } catch {
      console.log("handleDisconnect error")
    }
  }


  async hanldleSendNotification(clientId: number, data: any) {
    console.log("sending notification to", clientId);
    console.log("connected users", this.onlineUsers)
    const sockets = this.onlineUsers.get(clientId);
    console.log("sockets", sockets);
    if (sockets) {
      this.server.to(sockets).emit('notification', data);
    }
  }

  async handleSendFriendRequest(clientId: number, data: any) {
    const sockets = this.onlineUsers.get(clientId);
    if (sockets) {
      sockets.forEach(socket => {
        this.server.to(socket).emit('friendRequest', data);
      });
    }
  }

  async handleAcceptFriendRequest(clientId: number, data: any) {
    const sockets = this.onlineUsers.get(clientId);
    if (sockets) {
      sockets.forEach(socket => {
        this.server.to(socket).emit('acceptFriendRequest', data);
      });
    }
  }

  async handleSendMessage(clientId: number, data: any) {
    const sockets = this.onlineUsers.get(clientId);
    if (sockets) {
      this.server.to(sockets).emit('message', data);
    }
  }

}
