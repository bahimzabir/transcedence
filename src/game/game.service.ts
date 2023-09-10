import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Req } from '@nestjs/common';
import { GameRecords } from 'src/dto';
import { Server, Socket } from "socket.io"

interface Ball {
	x: number;
	y: number;
	velocityX: number;
	velocityY: number;
	speed: number;
}

interface GameData {
	ball: Ball;
	leftPlayerY: number;
	rightPlayerY: number;
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

@Injectable()
export class GameService {

    constructor(private prisma: PrismaService) { }

    private rooms: Room[] = [];

    getRooms() : Room[] { return this.rooms; }

    async addRoom(room: Room) { this.rooms.push(room); }

    async removeRoom(roomName: string) {
        this.rooms = this.rooms.filter(room => (room.roomName !== roomName));
    }

}
