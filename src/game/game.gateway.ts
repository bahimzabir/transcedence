import { 
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    MessageBody
  } from '@nestjs/websockets';
  
  
import { Server, Socket } from "socket.io"

const sockerConfig = {
    cors: {
      origin: ['*'],
      credentials: true,
    },
    namespace: 'game',
  };

@WebSocketGateway(sockerConfig)
export class GameGateway implements OnGatewayConnection {

  @WebSocketServer()
  server: Server;




  async handleConnection(client: Socket) : Promise<void> {
    console.log("connect");
    }
}