import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { GameService } from "./game.service";



const socketConfig = {
	cors: {
		origin: ['http://localhost:5173', 'http://10.14.8.7:5173', 'http://10.14.8.7:3000'],
		credentials: true
	},
	namespace: 'stream'
};


@WebSocketGateway( socketConfig )
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private gameService: GameService) {}

    @WebSocketServer()
    server: Server;

    async handleConnection(client: any, ...args: any[]) {
        console.log("hello world");
        console.log(this.gameService.getRooms());
    }

    async handleDisconnect(client: any) {
        
    }

}
