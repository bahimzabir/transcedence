import { Body } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { subscribe } from 'diagnostics_channel';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from 'src/chat/dto/create-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;
  sockets = new Map<number, Socket>();
  @SubscribeMessage("newConnection")
  newConnection(client: Socket, message: any) {
    console.log(message)
    console.log(client.id)
    // console.log({CreateChatDto : createChatDto});
    // this.sockets.set(createChatDto.id, client);
  }

  handleConnection(client: Socket, @Body() CreateChatDto): void {
    // console.log({socket: client})
    // console.log(client.id);
    // console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log({ data });
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    console.log({ data });
    return data;
  }
}
