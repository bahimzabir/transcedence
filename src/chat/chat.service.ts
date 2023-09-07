import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRoomBody } from './entities/chat.entity';
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) { }


  async createdm(req, body)
  {
    try {
      const reciveruser = await this.prisma.user.findUnique({
        where: {
          id: +body.receiver,
        }
      })
      const userchat = await this.prisma.chatRoom.create({
        data: {
          name : reciveruser.username,
          isdm: true,
          photo: reciveruser.username + ".png",
        }
      })
      const user = await this.prisma.user.findUnique({
        where:{
          id: +req.user.id,
        }
      })
      const receiverchat = await this.prisma.chatRoom.create({
        data: {
          name : user.username,
          isdm: true,
          photo: user.username + ".png",
        }
      })
      const useroom = await this.prisma.roomUser.create({
        data:{
          userId: +req.user.id,
          roomId: userchat.id,
        }
      })
      const receiveroom = await this.prisma.roomUser.create({
        data:{
          userId: +body.receiver,
          roomId: receiverchat.id,
        }
      })
      return true;
    } catch (error) {
        console.log({error: "error occured when trying create adm between id " + req.user.id +  " and " + body.receiver})
        return false;
      }
  }

  async createChatRoom(req, body: ChatRoomBody) {
    try {
      const chatRoom = await this.prisma.chatRoom.create({
        data: {
          name: body.name,
        },
      });
      await this.prisma.chatRoom.update({
        where: {
          id: chatRoom.id,
        },
        data:{
          photo: "http://localhost:8000/roomimg/" + chatRoom.id + "room.png",
        }
      })
      const roomUser = await this.prisma.roomUser.create({
        data: {
          userId: req.user.id,
          roomId: chatRoom.id,
        },
      });
      const admin = await this.prisma.roomAdmin.create({
        data:{
          roomId: +chatRoom.id,
          userId: +req.user.id,
        }
      })
      console.log("room created successfully with name of ", chatRoom.name)
      return chatRoom;
    } catch (error) {
      throw new Error('error occured while creating chat room');
    }

  }

  getUserJwt(token: string) {
    const Decoded = jwt.verify(token, this.config.get('JWT_SECRET'));
    return Decoded;
  }

  async create(createMessageDto: CreateChatDto, sender: number) {

    const id: number = +createMessageDto.id;
    console.log("id is " ,id)
    await this.prisma.message.create({
      data: {
        content: createMessageDto.message,
        senderId: sender,
        roomId: id,
      }
    })
  }

  async findAll() {
    try {
      const rooms = await this.prisma.chatRoom.findMany({
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  photo: true,
                }
              }
            }
          },
          roomUsers: {
            select: {
              user: {
                select: {
                  id: true,
                  username: true,
                  photo: true,
                }
              }
            }
          },
          admins: {
            select: {
              user: {
                select: {
                  id: true,
                  username: true,
                  photo: true,
                }
              }
            }
          },
        },
      });
      return rooms;
    } catch (error) {
      throw new Error('error occured while getting all chat rooms');
    }
  }
  async roomInfos(id: number)
  {
    const room = await this.prisma.chatRoom.findUnique({
      where: {
          id: +id,
      },
      select: {
        members: true,
        messages: true,
        admins: {
          select: {
              userId: true,
          }
        }
      }
    })
    return room;
  }

  async joinroom(userId:number, roomId:number)
  {
    console.log("userID", userId);
    console.log("roomID", roomId);
      try {
        const roomUser = await this.prisma.roomUser.create({
          data: {
            userId: +userId,
            roomId: +roomId,
          },
        });
      } catch (error) {
        console.log(error)
      }
  }
  async getroommgs(id: number)
  {
    try {
      const msg = await this.prisma.chatRoom.findFirst({
        where: {
          id: +id,
        },
        select:{
          messages: true,
        }
      })
      return msg;
    } catch (error) {
      console.log(error);
    }
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
