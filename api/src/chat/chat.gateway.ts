import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService, JwtWebSocketGuard } from './chat.service';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsGateway} from 'src/events/events.gateway';
import { NotificationDto, chatroomRequest, userevents, messageDto } from 'src/dto';
import {ConsoleLogger, Controller, UseGuards,Injectable } from '@nestjs/common';
enum freindship {
  BLOCKED
}
@Injectable()
@UseGuards(JwtWebSocketGuard)
@WebSocketGateway({
  cors: {
    origin: ['http://client/', 'http://nginx:80'],
  },
  namespace:"chat",
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
  }


  @SubscribeMessage("rmchat")
  async removeroom(@ConnectedSocket() client, @MessageBody() roomid: number)
  {
    const userid: number =  client.user.id;
    try{
      this.chatService.removechat(userid, roomid[0]);
    }
    catch(error){
      this.server.to(this.sockets.get(userid).id).emit("error", error.message);
    }  
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
  @SubscribeMessage("muteuser")
  async muteuser(@ConnectedSocket() client, @MessageBody() dto: userevents)
  {
    const userid: number = client.user.id;
    try {
        await this.chatService.mute(userid, dto[0]);
    }
    catch(error){
      this.server.to(this.sockets.get(userid).id).emit("error", error.message);
    }
  }
  @SubscribeMessage("setadmin")
  async setadmin(@ConnectedSocket() client, @MessageBody() dto: userevents)
  {
    const userid: number = client.user.id;
    try {
      this.chatService.setadmin(userid, dto[0]);
      this.server.to(client.id).emit("info", "the user is now admin");
    } catch (error) {
      this.server.to(client.id).emit("error", error.message);
    }
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
      if(this.sockets.has(dto[0].id)){
        this.server.to(this.sockets.get(dto[0].id).id).emit("leave");
      }
      this.server.to(this.sockets.get(userid).id).emit("info", "the user got kicked");        
    }
    catch(error){
      this.server.to(this.sockets.get(userid).id).emit("error", error.message);
    }
  }
  async handleConnection(client: any) {
    console.log("chat socket CONNECTED")
    const id = this.getclientbysocket(client);
    this.sockets.set(id, client)
  }
  async handleDisconnect(@ConnectedSocket() client) {
    console.log("DISCONNECTED")
    const id = this.getclientbysocket(client);
    this.sockets.delete(id)
  }
  async unreadmessage(receiverid: number, dto: messageDto){
    await this.prisma.$transaction(async (tsx)=>{
      const roomuser = await tsx.roomUser.findFirst({
        where:{
          userId: receiverid,
          roomId: dto.roomid,
        }
      })
      await tsx.roomUser.update({
        where:{
          id: roomuser.id,
        },
        data:{
          unreadMessage: true,
        }
      })
    })
  }
  @SubscribeMessage('createMessage')
  async create(@MessageBody() dto: messageDto, @ConnectedSocket() client) {
    const id =  client.user.id;
    const room = await this.chatService.getchatroombyid(dto[0].id);
    if(!this.chatService.isexist(room, id)){
      this.server.to(this.sockets.get(id).id).emit("error", "you are not in this room");
      return false
    }
    if(this.chatService.ismuted(room, id))
      return false;
    for(const user of room.members) {
      if(user.id !== id)
      {
        const freindship = await this.chatService.getUserfreindship(id, user.id);
        if (freindship && freindship.status === 'BLOCKED') {
          if (room.isdm)
            return false;
        }
        else if(this.sockets.has(user.id))
        {
          console.log("OMG")
         this.server.to(this.sockets.get(user.id).id).emit('newmessage', dto[0])
        }
        else
          this.unreadmessage(user.id, dto[0]);
    }
  }
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
      this.server.to(this.sockets.get(client.user.id).id).emit("warning")
      return ;
    }
    const dto: chatroomRequest = body[0];
    const clientid: number = client.user.id;
    const notify: NotificationDto = {
      userId: dto.userid,
      from: clientid,
      type: 'roomrequest',
      message: 'you are invited to join a room',
      photo: `/images/${dto.roomid}.png`,
      read: false,
      roomid: dto.roomid,
    }
    try {
      this.events.hanldleSendNotification(dto.userid, clientid, notify)
      this.server.to(this.sockets.get(clientid).id).emit("success");
    }
    catch(error){
      this.server.to(this.sockets.get(clientid).id).emit("error");
    }
  }
  @SubscribeMessage('removeChat')
  async remove(@ConnectedSocket() client, @MessageBody('id') id: number) {
    const userid: number =  client.user.id;
    return this.chatService.remove(userid, id);
  }
  @SubscribeMessage("messageSeen")
  async messageSeen(@ConnectedSocket() client, @MessageBody() roomid: number) {
    const userid: number =  client.user.id;
    return this.chatService.messageSeen(userid, roomid[0]);
  }
  @SubscribeMessage("messagedontseen")
  async messagedontseen(@MessageBody() dto) {
    return this.chatService.messagedontseen(dto[0].id, dto[0].roomid);
  }
}
