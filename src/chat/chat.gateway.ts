import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Body } from '@nestjs/common';
import { Socket , Server} from 'socket.io';
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

  sockets = new Map<string, Socket>();
  i = 0;

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


  @SubscribeMessage('receiveMessage')
  async receiveMessage(@MessageBody() createChatDto: any) {
    console.log("RECEIVE : ")
    console.log(createChatDto)
  }
  @SubscribeMessage("message")
  async onChat(client: Socket,@Body() createchatdto : CreateChatDto) {
    let newDto = new CreateChatDto();
    newDto.id = 1;
    newDto.receiverId = 2;
    newDto.message = "HI";
    newDto.isDm = true;

    this.chatService.SendMessage(newDto);
    this.sockets.forEach((value, key) => {
        // value.emit("receiveMessage", "HIIII");
        this.server.to(value.id).emit("receiveMessage", "HIIII");
        this.i = 1;
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
