import { Socket } from "socket.io";

export interface Ball {
	x: number;
	y: number;
	velocityX: number;
	velocityY: number;
	speed: number;
}

export interface GameData {
	ball: Ball;
	playerY: number;
	botY: number;
	leftScore: number;
	rightScore: number;
}

export interface Player {
	socket: Socket;
	id: number;
};

export interface Room {
	roomName: string;
	player: Player;
	data: GameData;
	done: boolean;
}