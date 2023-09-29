import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService, JwtWebSocketGuard } from './chat.service';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsGateway} from 'src/events/events.gateway';
import { NotificationDto, chatroomRequest, userevents, messageDto } from 'src/dto';
import { UseGuards } from '@nestjs/common';
enum freindship {
  BLOCKED
}

@UseGuards(JwtWebSocketGuard)
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

  getclientbysocket(client: Socket) {
    let token = client.handshake.headers.cookie;
    let id: number;
    if (token) {
      token = token.split('=')[1];
      const decoded = this.chatService.getUserJwt(token);
      id = +decoded.sub;
      return id;
    }
    throw "NOT FOUND";
  }


  @SubscribeMessage("rmchat")
  async removeroom(@ConnectedSocket() client, @MessageBody() roomid: number)
  {
    const userid: number =  client.user.id;
    this.chatService.removechat(userid, roomid[0]);
  }

  @SubscribeMessage("leaveroom")
  async leaveroom(@ConnectedSocket() client, @MessageBody() roomid: number)
  {
    const userid:number = client.user.id
    try {
      this.chatService.leaveroom(userid, roomid[0]);
      this.server.to(client.id).emit("leavebyexit",  "👋 you left the room");
    } catch (error) {
      this.server.to(client.id).emit("error", error);
    }
  }
  @SubscribeMessage("removeadmin")
  async removeadmin(@ConnectedSocket() client, @MessageBody() dto: userevents)
  {
    const userid: number = client.user.id
    return this.chatService.removeadmin(userid, dto[0]);
  }

  @SubscribeMessage("muteuser")
  async muteuser(@ConnectedSocket() client, @MessageBody() dto: userevents)
  {
    const userid: number = client.user.id;
    try {
        await this.chatService.mute(userid, dto[0]);
    }
    catch(error){
      this.sockets[userid].emit("error", error.message);
    }
  }
  @SubscribeMessage("setadmin")
  async setadmin(@ConnectedSocket() client, @MessageBody() dto: userevents)
  {
    const userid: number = client.user.id;
    return this.chatService.setadmin(userid, dto[0]);
  } 
  @SubscribeMessage("banuser")
  async banuser(@ConnectedSocket() client, @MessageBody() dto: userevents)
  {
    const userid: number =  client.user.id;
    this.chatService.ban(userid, dto[0]);
  }
  @SubscribeMessage("kickuser")
  async kickuser(@ConnectedSocket() client, @MessageBody() dto: userevents) {
    const userid: number =  client.user.id;
    try{
      await this.chatService.kick(userid, dto[0])
      if(this.sockets[dto[0].id]){
        this.server.to(this.sockets[dto[0].id].id).emit("leave");
        client.emit("info", "the user got kicked");        
      }
    }
    catch(error){
      this.sockets[userid].emit("error", error.message);
    }
  }
  async handleConnection(client: any) {
    const id = this.getclientbysocket(client);
    this.sockets[id] = client;
  }
  async handleDisconnect(@ConnectedSocket() client) {

    const id = this.getclientbysocket(client);
    this.sockets.delete(id);
  }
  sendnotify(receiverid: number, senderid: number , dto: messageDto){
    const data: NotificationDto = {
      userId: receiverid,
      from: senderid,
      type: 'message',
      photo: `http://localhost:3000/${senderid}.png`,
      message: dto.message,
      read: false,
    }
    this.events.hanldleSendNotification(receiverid, senderid, data);
  }
  @SubscribeMessage('createMessage')
  async create(@MessageBody() dto: messageDto, @ConnectedSocket() client) {
    const id =  client.user.id;
    const room = await this.chatService.getchatroombyid(dto[0].id);
    if(!this.chatService.isexist(room, id)){
      client.emit("error", "you are not in this room");
      return false
    }
    if(this.chatService.ismuted(room, id))
      return false;
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
            this.sockets[user.id].emit('newmessage', dto[0])
          }
        }
        else
        this.sendnotify(user.id, id, dto[0]);
    }
  })
  this.chatService.create(dto[0], id);
    return true;
  }

  @SubscribeMessage("invite")
  async invitToRoom(@MessageBody() body: chatroomRequest, @ConnectedSocket() client) {
    const notifaction = await this.prisma.notification.findMany({
      where: {
        type: 'roomrequest',
        from: body.userid,
        roomid: body.roomid,
      },
    });
    if(notifaction.length > 0)
    {
      client.emit("warning");
      return ;
    }
    const dto: chatroomRequest = body[0];
    const clientid: number = client.user.id;
    const notify: NotificationDto = {
      userId: dto.userid,
      from: clientid,
      type: 'roomrequest',
      message: 'you are invited to join a room',
      photo: `http://localhost:3000/${dto.roomid}.png`,
      read: false,
      roomid: dto.roomid,
    }
    try {
      this.events.hanldleSendNotification(dto.userid, clientid, notify)
      client.emit("success");
    }
    catch(error){
      client.emit("error");
    }
  }
  @SubscribeMessage('removeChat')
  async remove(@ConnectedSocket() client, @MessageBody() id: number) {
    const userid: number =  client.user.id;
    return this.chatService.remove(userid, id);
  }
}
