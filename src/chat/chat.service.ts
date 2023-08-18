import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}
    async getChats(req: any) {
        try {
            const chats = await this.prisma.chatRoom.findMany({
               where: {
                     members: {
                          some: {
                            id: req.user.id,
                          },
                     },
                },
            });
            return chats;
        } catch (error) {
            console.log('error occured while fetching chats');
        }
    }

    async createChat(req: any, body: any) {
        try {
            const chat = await this.prisma.chatRoom.create({
                data: {
                    name: body.name,
                    members: {
                        connect: {
                            id: req.user.id,
                        },
                    },
                },
            });
            return chat;
        } catch (error) {
            console.log('error occured while creating chat');
        }
    }

    async addMember(req: any, body: any) {
        try {
            const chat = await this.prisma.chatRoom.update({
                where: {
                    id: body.chatId,
                },
                data: {
                    members: {
                        connect: {
                            id: body.userId,
                        },
                    },
                },
            });
            return chat;
        } catch (error) {
            console.log('error occured while adding member');
        }
    }

    async deleteMember(req: any, body: any) {
        try {
            const chat = await this.prisma.chatRoom.update({
                where: {
                    id: body.chatId,
                },
                data: {
                    members: {
                        disconnect: {
                            id: body.userId,
                        },
                    },
                },
            });
            return chat;
        } catch (error) {
            console.log('error occured while deleting member');
        }
    }

    async addMessage(req: any, body: any) {
        try {
            const message = await this.prisma.message.create({
                data: {
                    content: body.content,
                    chatRoom: {
                        connect: {
                            id: body.chatId,
                        },
                    },
                    sender: {
                        connect: {
                            id: req.user.id,
                        },
                    },
                },
            });
            return message;
        } catch (error) {
            console.log('error occured while adding message');
        }
    }

    async getMessages(req: any, body: any) {
        try {
            const messages = await this.prisma.message.findMany({
                where: {
                    chatRoomId: body.chatId,
                },
                include: {
                    sender: true,
                },
            });
            return messages;
        } catch (error) {
            console.log('error occured while fetching messages');
        }
    }

}
