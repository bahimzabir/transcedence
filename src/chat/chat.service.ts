import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRoomBody } from 'src/dto/auth.dto';
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) { }

  private config: ConfigService;



  async createChatRoom(req, body: ChatRoomBody) {
    try {
      console.log("HOOLLLLA")
      const chatRoom = await this.prisma.chatRoom.create({
        data: {
          name: body.name,
        },

      });
      console.log("GOOT HERE")
      console.log(req.user.id);
      const roomUser = await this.prisma.roomUser.create({
        data: {
          userId: req.user.id,
          roomId: chatRoom.id,
        },
      });
      console.log("room created successfully with name of ", chatRoom.name)
      return chatRoom;
    } catch (error) {
      throw new Error('error occured while creating chat room');
    }
  }

  getUserJwt(token: string) {
    const Decoded = jwt.verify(token, 'very-very-secret-hahaha');
    return Decoded;
  }


  async create(createMessageDto: CreateChatDto, sender: number) {
    const id: number  = createMessageDto.id;
    console.log("id is " ,id)
    await this.prisma.message.create({
      data: {
        content: createMessageDto.message,
        senderId: sender,
        roomId: id,
      }
    })
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
