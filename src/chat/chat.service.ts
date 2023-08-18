import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ChatRoomBody } from 'src/dto';
import { connect } from 'http2';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}
    async createChatRoom(req: any, body: ChatRoomBody) {
        try {
            const chatRoom = await this.prisma.chatRoom.create({
                data: {
                    name: body.name,
                },
                
            });

            const roomUser = await this.prisma.roomUser.create({
                data: {
                    userId: req.user.id,
                    roomId: chatRoom.id,
                },
            });
            return chatRoom;
        } catch (error) {
            throw new Error('error occured while creating chat room');
        }
    }
}
