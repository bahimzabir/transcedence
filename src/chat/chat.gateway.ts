import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Body } from '@nestjs/common';
import { Socket , Server} from 'socket.io';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken'
import { subscribe } from 'diagnostics_channel';
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
  server: Server;
  sockets = new Map<string, Socket[]>();
  handleConnection(client: Socket): void {
    console.log('connected');
    let cookie = client.handshake.headers.cookie;
    cookie = cookie.split(" ")[1];
    const payload = jwt.verify(cookie, 'very-very-secret-hahaha')
    const parsePayload = JSON.parse(JSON.stringify(payload));
    this.sockets.set(parsePayload.sub, [client]);
  }

  handleDisconnect(client: Socket): void {
    console.log("the client: ", client.id, " disconnected");
  }
  @SubscribeMessage('createChat')
  create(@MessageBody() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }


  @SubscribeMessage('receiveMessage')
  async receiveMessage(@MessageBody() createChatDto: any) {
    console.log("RECEIVE : ")
    console.log(createChatDto)
  }
  @SubscribeMessage("message")
  async onChat(client: Socket, @Body() createchatdto : CreateChatDto) {
    let newDto = new CreateChatDto();
    newDto.id = 1;
    newDto.receiverId = 2;
    newDto.message = "HI";
    newDto.isDm = true;

    this.chatService.SendMessage(newDto);
    console.log("---->", this.sockets.size)
    this.sockets.forEach((value, key) => {
      if(key != newDto.id.toString()){
        console.log("HIIIII")
        this.server.to(value[0].id).emit("receiveMessage", "HIIII");
      }
    })
    //get the second user socket id
    //send the message to the second user
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
