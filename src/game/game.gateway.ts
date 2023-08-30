import { Interval } from '@nestjs/schedule';
import { 
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	ConnectedSocket
} from '@nestjs/websockets';

import * as jwt from "jsonwebtoken"

import { Server, Socket } from "socket.io"
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';
import { Console } from 'console';


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
	namespace: 'game'
};


@WebSocketGateway( socketConfig )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

	// constructor(private gameService: GameService, private userService: UserService) {}

	@WebSocketServer()
	server: Server;

	private queue: Player[] = [];
	private rooms: Room[] = [];

	private roomNames: String[] = [];

	async handleConnection(client: Socket) : Promise<void> {
		const cookie = client.handshake.headers.cookie;
		const jwtToken = cookie.split('=')[1];

		const jwtPayload : any = jwt.verify(jwtToken, 'very-very-secret-hahaha');
		const userId = jwtPayload.sub;

		console.log(`${userId} connected!!`);

		let player: Player = {
			socket: client,
			id: userId,
			side: !(this.queue.length % 2) ? "left" : "right"
		}

		this.queue.push(player);

		if (this.queue.length >= 2)
		{
			const players = this.queue.splice(0, 2);
			const roomName: string = this.createNewRoom();

			
			let room: Room = {
				roomName: roomName,
				players: players,
				data: {
					ballPos: {x: 500, y:300},
					leftPlayerY: 250,
					rightPlayerY: 250,
					speedX: 2,
					speedY: 1
				}
			};

			players.forEach(player => {
				player.socket.join(roomName);
			});

			console.log(room);
			this.server.to(room.roomName).emit("join_room", {
				data: room.data,
				roomName: room.roomName,
				playerOneId: players[0].id,
				playerTwoId: players[1].id
			});
			this.rooms.push(room);
		}
	}

	private createNewRoom() : string {
		let roomName: string;

		do {
			roomName = Math.random().toString(36).substring(7);
		} while (this.roomNames.includes(roomName));

		this.roomNames.push(roomName);

		return roomName;
	}

	// handle disconnection of one of the players
	handleDisconnect(client: Socket) {}

	@Interval(10)
	async moveBall() {
		for (let room of this.rooms) {
			room.data.ballPos.x += room.data.speedX;
			room.data.ballPos.y += room.data.speedY;

			if (room.data.ballPos.y >= 595 || room.data.ballPos.y <= 5) {
				room.data.speedY *= -1;
			}
			if (room.data.ballPos.x > 1000 || room.data.ballPos.x < 0) {
				room.data.ballPos = {x: 500, y:300};
				room.data.speedX *= -1;
				room.data.speedY *= -1;
			}

			if (room.data.ballPos.x <= 10 && (room.data.ballPos.y > room.data.leftPlayerY && room.data.ballPos.y < room.data.leftPlayerY+80)) {
				room.data.speedX *= -1;
			}
			  if (room.data.ballPos.x >= 990 && (room.data.ballPos.y > room.data.rightPlayerY && room.data.ballPos.y < room.data.rightPlayerY+80)) {
				room.data.speedX *= -1;
			}
			this.server.to(room.roomName).emit("update", room.data);
		}
	}

	@SubscribeMessage("move")
	async movePaddle(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		let room = this.getRoomByName(data.roomName);
		
		if (room === undefined) {
			return ;
		}

		if (client === room.players[0].socket) {
			room.data.leftPlayerY = data.posY;
		}
		else if (client === room.players[1].socket) {
			room.data.rightPlayerY = data.posY;
		}
		this.server.to(data.roomName).emit("update", room.data);
	}


	private getRoomByName(roomName: string) : Room | undefined {
		for (let room of this.rooms) {
			if (room.roomName === roomName) {
			  return room;
			}
		}
		return undefined;
	}
}
