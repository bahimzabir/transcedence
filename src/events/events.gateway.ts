import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
// import { JwtGard } from 'src/auth/guard';
import {JwtStartegy} from 'src/auth/startegy'
import * as jwt from 'jsonwebtoken'
import { WsGuard } from 'src/auth/guard';

const sockerConfig = {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5501', 'http://localhost:5501'],
    credentials: true,
  },
  namespace: 'user',
};

@WebSocketGateway(sockerConfig)
export class EventsGateway {
  @WebSocketServer()
  server: Server;
  async handleConnection(client: Socket, ...args: any): Promise<void> {
    // const cookies = client.handshake.headers.cookie;
    // const token = cookies ? cookies.split("=")[1] : "Cookeis not sent"
    console.log({connected: client.id});
  }
  
  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }
  
  
  @UseGuards(WsGuard)
  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log( "events is here");
    //console.log({message_from_client: data.message, id : data.id})
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    //console.log({ data });
    return data;
  }
}
