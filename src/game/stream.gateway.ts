import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { GameService } from "./game.service";
import { Injectable } from "@nestjs/common";



const socketConfig = {
	cors: {
		origin: ['http://localhost:5173', 'http://10.14.8.7:5173', 'http://10.14.8.7:3000'],
		credentials: true
	},
	namespace: 'stream'
};

@Injectable()
@WebSocketGateway( socketConfig )
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private gameService: GameService) {}

    @WebSocketServer()
    server: Server;

    async handleConnection(client: any, ...args: any[]) {
        console.log(this.gameService.getRooms());
    }

    async handleDisconnect(client: any) {
        
    }

    async updateRooms() {
        let rooms = [];
        for (let room of this.gameService.getRooms()) {
            rooms.push({
                data: room.data,
				roomName: room.roomName,
				playerOneId: room.players[0].id,
				playerTwoId: room.players[1].id
            });
        }
        this.server.emit("updateRooms", rooms);
        console.log(rooms);
    }

}
