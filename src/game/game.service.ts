import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Req } from '@nestjs/common';
import { GameRecords } from 'src/dto';
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

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService) { }

    private rooms: Room[] = [];

    getRooms() : Room[] { return this.rooms; }

    addRoom(room: Room) : void { this.rooms.push(room); }

    async addGameRecords(req: any, body: GameRecords) {
        try {
            const user = await this.prisma.user.update({
                where: {
                    id: req.user.id,
                },
                data: {
                    goalsconceded: { increment: (parseInt(body.goalsconceded) || 0) },
                    goalsscored: { increment: (parseInt(body.goalsscored) || 0) },
                    draws: { increment: (parseInt(body.draw) || 0) },
                    wins: { increment: (parseInt(body.win) || 0) },
                    losses: { increment: (parseInt(body.lose) || 0) },
                },

            })
            //console.log(user)
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    
    async gameStatus({ player1, player2, player1score, player2score }) {
        try {
            const game = await this.prisma.game.create({
                data: {
                    paleyer1: player1,
                    paleyer2: player2,
                    player1score: player1score,
                    player2score: player2score,
                }
            })

        }
        catch (error) {
            throw error;
        }
    }
}
