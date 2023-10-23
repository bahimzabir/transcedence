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
	leftPlayerY: number;
	rightPlayerY: number;
	leftScore: number;
	rightScore: number;
}

export interface Player {
	socket: Socket;
	id: number;
	side: string;
};

export interface Room {
	roomName: string;
	players: Player[];
	data: GameData;
    done: boolean;
	mode: string;
}