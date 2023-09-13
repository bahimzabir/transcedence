import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket, Server } from 'socket.io';
import { Body } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { connect } from 'http2';
import { EventsGateway } from 'src/events/events.gateway';
import { NotificationDto } from 'src/dto';
enum freindship{
  BLOCKED
}
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService, private prisma: PrismaService, private events:EventsGateway) { }
  @WebSocketServer()
  server: Server;
  sockets = new Map<number, Socket>();


  async handleConnection(client: Socket) {
    let token = await client.handshake.headers.cookie;
    let id: number;
    if (token) {
      token = token.split('=')[1];
      const decoded = this.chatService.getUserJwt(token);
      id = +decoded.sub;
      this.sockets[id] = client;
    }
  }
  handleDisconnect(@ConnectedSocket() client: Socket): void {
    let token = client.handshake.headers.cookie;
    let id: number;
    if (token) {
      token = token.split('=')[1];
      const decoded = this.chatService.getUserJwt(token);
      id = +decoded.sub;
    }
    this.sockets.delete(id);
  }
  @SubscribeMessage('createMessage')
  async create(@MessageBody() dto: CreateChatDto, @ConnectedSocket() client: Socket) {
    let token = client.handshake.headers.cookie;
    let id: number;
    if (token) {
      token = token.split('=')[1];
      const decoded = this.chatService.getUserJwt(token);
      id = +decoded.sub;
      const ids = await this.prisma.chatRoom.findMany({
        where: {
          id: dto[0].id,
        },
        select:{
          members: {
            select: {
              id: true,
            }
          }
        }
      })
      const users = ids[0].members;
      this.chatService.create(dto[0], id);
      for (let index = 0; index < users.length; index++) {
        const userid = users[index].id;
        if(userid !== id)
        {
          const freindship = await this.chatService.getUserfreindship(id, userid);
          const usersocket = this.sockets[userid];
          if(usersocket !== undefined)
          {
            // console.log("GOT HERE");
            if(freindship.status == 'BLOCKED')
            {
              dto[0].message = "***************";
            }
            this.server.to(usersocket.id).emit('newmessage', dto)
          }
          else{
            console.log("GOT HERE2222");
            const data: NotificationDto = {
              userId: userid,
              from: id,
              type: 'message',
              data: dto,
              read: false,
            }
            this.events.hanldleSendNotification(userid, id, data);
          }
        }
      }
      return true;
    }    
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto);
  }
  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }
}
