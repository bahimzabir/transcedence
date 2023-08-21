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
// import { JwtModule } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken'

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
  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.headers.cookie.split('=')[1];
   let payload : any = jwt.verify(token, 'very-very-secret-hahaha')
    console.log(payload)
    // const user = await this.jwtStrategy.validate( {sub :payload.sub, email: payload.email} );
    console.log({Client_connected: client.id});
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }


  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    //console.log({ data });
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
