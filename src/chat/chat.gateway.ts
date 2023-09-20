import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';
import { NotificationDto, kickuser, messageDto } from 'src/dto';
enum freindship {
  BLOCKED
}
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService, private prisma: PrismaService, private events: EventsGateway) { }
  @WebSocketServer()
  server: Server;
  sockets = new Map<number, Socket>();


  async getclientbysocket(client: Socket) {
    let token = await client.handshake.headers.cookie;
    let id: number;
    if (token) {
      token = token.split('=')[1];
      const decoded = this.chatService.getUserJwt(token);
      id = +decoded.sub;
      return id;
    }
    throw "NOT FOUND";
  }
  @SubscribeMessage("banuser")
  async banuser(@ConnectedSocket() client: Socket, @MessageBody() dto: kickuser)
  {
    const userid: number = await this.getclientbysocket(client);
    this.chatService.ban(userid, dto[0]);
  }
  @SubscribeMessage("kickuser")
  async kickuser(@ConnectedSocket() client: Socket, @MessageBody() dto: kickuser) {
    console.log("GOT HERE WIT DTO", dto);
    const userid: number = await this.getclientbysocket(client);
    this.chatService.kick(userid, dto[0]);
    if(this.sockets[dto[0].id])
    {
        this.server.to(this.sockets[dto[0].id].emit("kick", dto[0]));
    }
  }

  async handleConnection(client: Socket) {

    const id: number = await this.getclientbysocket(client);
    this.sockets[id] = client;
  }
  async handleDisconnect(@ConnectedSocket() client: Socket) {

    const id: number = await this.getclientbysocket(client);
    this.sockets.delete(id);
  }
  sendnotify(receiverid: number, senderid: number , dto: messageDto){
    const data: NotificationDto = {
      userId: receiverid,
      from: senderid,
      type: 'message',
      data: dto,
      read: false,
    }
    this.events.hanldleSendNotification(receiverid, senderid, data);
  }
  @SubscribeMessage('createMessage')
  async create(@MessageBody() dto: messageDto, @ConnectedSocket() client: Socket) {
    const id = await this.getclientbysocket(client);
    const room = await this.chatService.getchatroombyid(dto[0].id);
    if(room.members.find((user) => user.id === id) === undefined || room.mutedUser.find((muted)=> muted.id === id))
      return false
    room.members.forEach(async (user) => {
      if(user.id !== id)
      {
        if(this.sockets[user.id] !== undefined)
        {
          const freindship = await this.chatService.getUserfreindship(id, user.id);
          if (freindship && freindship.status == 'BLOCKED') {
            if (room.isdm)
              return false;
          }
          else {
            this.server.to(this.sockets[user.id].id).emit('newmessage', dto[0])
          }
        }
        else
        this.sendnotify(user.id, id, dto[0]);
    }
  })
  this.chatService.create(dto[0], id);
    return true;
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
