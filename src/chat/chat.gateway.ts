import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket, Server } from 'socket.io';
import { Body } from '@nestjs/common';
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) { }
  @WebSocketServer()
  server: Server;
  sockets = new Map<number, Socket>();



  @SubscribeMessage('newmessage')
  newMessage(@ConnectedSocket() client: Socket, @MessageBody() createChatDto: CreateChatDto) {
    console.log("new message received");
  }

  async handleConnection(client: Socket) {
    console.log("new connection");
    let token = await client.handshake.headers.cookie;
    let id: number;
    if (token) {
      token = token.split('=')[1];
      const decoded = this.chatService.getUserJwt(token);
      id = +decoded.sub;
      console.log("----->", id)
      this.sockets.set(id, client);
    }
  }
  handleDisconnect(client: Socket): void {
    //console.log(`Client disconnected: ${client.id}`);
  }
  @SubscribeMessage('createMessage')
  create(@MessageBody() dto: CreateChatDto, @ConnectedSocket() client: Socket) {
    // console.log("-------------->",dto.id)
    let token = client.handshake.headers.cookie;
    let id: number;
    if (token) {
      token = token.split('=')[1];
      const decoded = this.chatService.getUserJwt(token);
      id = +decoded.sub;
      
      this.chatService.create(dto[0], id);
      this.server.to(this.sockets.get(2).id).emit('newmessage', dto)

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
