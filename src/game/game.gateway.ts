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
import { RouterModule } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { StreamGateway } from './stream.gateway';


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
	namespace: 'game'
};

@Injectable()
@WebSocketGateway( socketConfig )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private gameService: GameService,
		private streamGateway: StreamGateway) {}

	@WebSocketServer()
	server: Server;

	private queue: Player[] = [];

	private roomNames: String[] = [];

	async handleConnection(client: Socket) : Promise<void> {
		const cookie = client.handshake.headers.cookie;
		const jwtToken = cookie.split('=')[1];

		const jwtPayload : any = jwt.verify(jwtToken, "8048af480a486c120bbca102e154762505e0a898");
		const userId = jwtPayload.sub;

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
					speedY: 1,
					leftScore: 0,
					rightScore: 0
				},
			};

			players.forEach(player => {
				player.socket.join(roomName);
			});

			this.server.to(room.roomName).emit("join_room", {
				data: room.data,
				roomName: room.roomName,
				playerOneId: players[0].id,
				playerTwoId: players[1].id
			});
			await this.gameService.addRoom(room);
			await this.streamGateway.addRoom(room);
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
	handleDisconnect(client: Socket) {
		console.log("handle Dis");
	}

	@Interval(10)
	async moveBall() {
		for (let room of this.gameService.getRooms()) {
			room.data.ballPos.x += room.data.speedX;
			room.data.ballPos.y += room.data.speedY;

			if (room.data.ballPos.y >= 595 || room.data.ballPos.y <= 5) {
				room.data.speedY *= -1;
			}
			if (room.data.ballPos.x > 1000 || room.data.ballPos.x < 0) {
				(room.data.ballPos.x > 1000) ? (room.data.leftScore += 1) : (room.data.rightScore += 1);
				this.resetData(room);

				this.streamGateway.updateScore(
					room.roomName,
					room.data.leftScore,
					room.data.rightScore
				);
			}

			if (room.data.ballPos.x <= 10 && (room.data.ballPos.y > room.data.leftPlayerY && room.data.ballPos.y < room.data.leftPlayerY+80)) {
				room.data.speedX += (room.data.speedX > 0) ? 1 : (-1);
				room.data.speedX *= -1;
			}
			if (room.data.ballPos.x >= 990 && (room.data.ballPos.y > room.data.rightPlayerY && room.data.ballPos.y < room.data.rightPlayerY+80)) {
				room.data.speedX += (room.data.speedX > 0) ? 1 : (-1);
				room.data.speedX *= -1;
			}
			this.server.to(room.roomName).emit("update", room.data);

			
			if (room.data.leftScore === 11 || room.data.rightScore === 11) {
				this.server.to(room.roomName).emit("endMatch");
				await this.gameService.removeRoom(room.roomName);
				await this.streamGateway.removeRoom(room.roomName);
			}
		}
		// await this.gameService.updateRooms();
	}

	private resetData(room: Room) : void  {
		room.data.ballPos = {x: 500, y:300};
		room.data.speedX = 2;
		room.data.speedY = 1;
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
		for (let room of this.gameService.getRooms()) {
			if (room.roomName === roomName) {
				return room;
			}
		}
		return undefined;
	}


	private brodcastGameData() {

	}

}

