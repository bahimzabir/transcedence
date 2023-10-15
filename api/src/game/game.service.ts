import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameRecords } from 'src/dto';
import { Socket } from "socket.io";
import { Room } from './game.interface';

@Injectable()
export class GameService {


    constructor(private prisma: PrismaService) { }

    private rooms: Room[] = [];

    getRooms() : Room[] { return this.rooms; }

    async addRoom(room: Room) { this.rooms.push(room); }

    async removeRoom(roomName: string) {
        this.rooms = this.rooms.filter(room => (room.roomName !== roomName));
    }

	

	async createGameRecord(body: GameRecords) {
		try {
            await this.addToWins(body.winnerId);
            await this.addToLosses(body.loserId);

			await this.prisma.game.create({
				data: {
                    players: {
                        connect: [
                            { id: body.player1Id },
                            { id: body.player2Id },
                        ],
                    },
                    player1Id: body.player1Id,
                    player2Id: body.player2Id,
					player1Score: body.player1Score,
					player2Score: body.player2Score,
					type: body.type,
			    }
		    });
		} catch (error) {
            console.log(error);
		}
	}

    async addToWins(id: number) {
        try {
            await this.prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    wins: {increment: 1}
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    async  addToLosses(id: number) {
        try {
            await this.prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    losses: {increment: 1}
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    async findRoom(userId: number) {
        const room  = this.rooms.find(r => {
            if (r.players[0].id === userId || r.players[1].id === userId)
                return r
            return null
        })
        return room
    }


}
