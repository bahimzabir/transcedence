import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket, Server} from 'socket.io';
import { Body } from '@nestjs/common';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer()
  server: Server
  sockets = new  Map<number, Socket[]>;



  @SubscribeMessage('newmessage')
  newMessage(client: Socket, createChatDto: CreateChatDto) {
    console.log("new message received");
  }
  handleConnection(client: Socket) {
    const userNtparsed = this.chatService.getUserJwt(client);
    const userId = this.chatService.getIdFromJwt(userNtparsed);
    this.sockets.set(userId, [client]);
  }
  @SubscribeMessage('createMessage')
  create(client: Socket, createChatDto: any) {
    this.chatService.create(createChatDto,  this.chatService.getIdFromJwt(
      this.chatService.getUserJwt(client)));
    this.server.to(this.sockets[createChatDto.receiverId]).emit('newmessage', createChatDto);
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
