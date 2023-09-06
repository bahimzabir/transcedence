import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io"

interface BallPos {
	x: number;
	y: number;
}

interface GameData {
	ballPos: BallPos;
	leftPlayerY: number;
	rightPlayerY: number;
	speedX: number;
	speedY: number;
	leftScore: number;
	rightScore: number;
}

interface Player {
	socket: Socket;
	id: number;
	side: string;
};

interface Room {
	roomName: string;
	players: Player[];
	data: GameData;
}

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
    private rooms = [];
    private map = Map<string , {score1: number, score2: number}>

    async handleConnection(client: Socket) {
        
        console.log("init");
        client.emit("initRooms", this.rooms);
    }

    async handleDisconnect(client: any) {
        
    }

    

    async addRoom(room: Room) {
        this.rooms.push({
            roomName: room.roomName,
            playerOneId: room.players[0].id,
			playerTwoId: room.players[1].id
        });

        this.server.emit("addRoom", {
            roomName: room.roomName,
            playerOneId: room.players[0].id,
			playerTwoId: room.players[1].id
        });
    }
}
