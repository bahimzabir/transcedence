import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Body } from '@nestjs/common';
import { Socket } from 'socket.io';
@WebSocketGateway(
  {
    cors:{
      origin: '*',
    }
  }
)
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer() 
  server;

  sockets = new Map<string, Socket>();

  handleConnection(client: Socket): void {
    console.log('connected');
    console.log("socket id ", client.id);
    this.sockets.set(client.id, client);
    console.log(this.sockets.size);
  }

  handleDisconnect(client: Socket): void {
    console.log("the client: ", client.id, " disconnected");
  }
  @SubscribeMessage('createChat')
  create(@MessageBody() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }


  @SubscribeMessage("message")
  async onChat(@Body() createchatdto : CreateChatDto) {
    this.chatService.SendMessage(createchatdto);
    this.server.to(this.sockets[createchatdto.receiverId]).emit("message", createchatdto);
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
