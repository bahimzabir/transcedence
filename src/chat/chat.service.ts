import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';
import * as jwt from 'jsonwebtoken'
@Injectable()
export class ChatService {
  constructor(readonly prisma: PrismaService) { }

  
  async checkChatExists(chatname: string) {
      const chatroom = await this.prisma.chatRoom.findMany(
        {
          where: {
            name: chatname,
          }
        }
      )
      if(!chatroom.length)
      {
        throw 'Chat does not exist'
      }
  }
async create(createChatDto: CreateChatDto) {
      try {
        const chatRoom = await this.prisma.chatRoom.create({
          data: {
            name: createChatDto.id + "ROOM_" + createChatDto.receiverId,
            public: createChatDto.isDm === true ? false : true,
            password: createChatDto.password,
          }
        })
      } catch (error) {
        console.log("ERROR occur here")
      }
    console.log("ROOOM HAS BEEN CREATED")
  }

  async createMessage(createChatDto: CreateChatDto) {
      const chatroom = await this.prisma.chatRoom.findMany({
        where: {
          name: createChatDto.id + "ROOM_" + createChatDto.receiverId,
        }
      })
      await this.prisma.message.create({
        data:{
          content: createChatDto.message,
          senderId: createChatDto.id,
          chatRoomId: chatroom[0].id,
      }})
  }
  async SendMessage(createChatDto: CreateChatDto) {
    try {
      const chatRoom = await this.prisma.chatRoom.findMany({
        where: {
          name: createChatDto.id + "ROOM_" + createChatDto.receiverId,
        }
      })
      if (chatRoom.length) {
        console.log("ROOM ALREADY EXIST")
        this.createMessage(createChatDto)
      }
      else
      {
        console.log("ROOM CREATED")
        this.create(createChatDto)
        this.createMessage(createChatDto)
      }
      return createChatDto.message;
    }
    catch (error) {
      console.error("ERROR occur here SendMEssage")
    }
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
