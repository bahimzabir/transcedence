import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';

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
  create(createChatDto: CreateChatDto) {
    try
    {
      this.checkChatExists(createChatDto.id + "ROOM_" + createChatDto.receiverId)
    }
    catch {
      try {
        this.prisma.chatRoom.create({
          data: {
            name: createChatDto.id + "ROOM_" + createChatDto.receiverId,
            public: createChatDto.isDm === true ? false : true,
            password: createChatDto.password,
          }
        })
      } catch (error) {
        console.log("ERROR occur here")
      }
    }
    console.log("ROOOM HAS BEEN CREATED")
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
