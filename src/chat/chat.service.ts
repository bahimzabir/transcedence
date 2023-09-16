import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService, PrismaTypes } from '../prisma/prisma.service';
import { ChatRoomBody } from './entities/chat.entity';
import { ConnectedSocket } from '@nestjs/websockets';
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) { }


  async getallrooms(){
    try{
      const rooms = await this.prisma.chatRoom.findMany({
        orderBy: {
          members: {
            _count: 'desc', 
          }
        },
        select:{
          id: true,
          name: true,
          photo: true,
          members_size: true,

        }
      });
      return rooms;
    }
    catch (error){
      console.log(error)
    }
  }
  async getroomembers(userid: number, roomID: number) {
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomID,
      },
      select: {
        roomUsers: true,
        admins: true,
        members:{
          select: {
            username: true,
            id: true,
          }
        }
      }
    })
    
    const r  = room.members.find((member) => {
      if (member.id == userid){
        return true
      }
    })
    return r ? room  : []
  }
  async getdmroominfos(id: number, sender: number) {
    const room = await this.prisma.chatRoom.findUnique({
      where: {
        id: +id,
      }
    })
    let userid: number;
    if (sender != room.senderID)
      userid = room.senderID;
    else
      userid = room.receiverID;
    const user = await this.prisma.user.findUnique({
      where: {
        id: +userid,
      },
      select: {
        username: true,
        photo: true,
      }
    })
    room.name = user.username;
    const friendship = await this.getUserfreindship(+id, +sender);
    if (friendship && friendship.status == 'BLOCKED')
      room.photo = "unknown.jpg";
    room.photo = user.photo;
    return room;
  }
  async createdm(req, body) {
    try {
      const search = await this.prisma.chatRoom.findFirst({
        where: {
          OR: [
            { AND: [{ senderID: +req.user.id }, { receiverID: +body.receiver }] },
            { AND: [{ senderID: +body.receiver }, { receiverID: +req.user.id }] }
          ],

        }
      });
      if (search)
        return false;
      const chatRoom = await this.prisma.chatRoom.create({
        data: {
          isdm: true,
          senderID: +req.user.id,
          receiverID: +body.receiver,
          members: {
            connect: [
              { id: req.user.id },
              { id: body.receiver },
            ]
          }
        }
      })
      const roomUser = await this.prisma.roomUser.create({
        data: {
          userId: req.user.id,
          roomId: chatRoom.id,
        },
      })
      const roomUser2 = await this.prisma.roomUser.create({
        data: {
          userId: body.receiver,
          roomId: chatRoom.id,
        },
      })
      return true;
    } catch (error) {
      console.log({ error: "error occured when trying create adm between id " + req.user.id + " and " + body.receiver })
      return false;
    }
  }

  async createChatRoom(req, body: ChatRoomBody) {
    try {
      let chatRoom
      await this.prisma.$transaction(async (tsx)=> {
        chatRoom = await tsx.chatRoom.create({
          data: {
            name: body.name,
            members: {
              connect: {
                id: req.user.id,
              }
            },
            members_size: 1,
          },
        });
        await tsx.chatRoom.update({
          where: {
            id: chatRoom.id,
          },
          data: {
            photo: "http://localhost:3000/" + chatRoom.id + "room.png",
          }
        })
        const roomUser = await tsx.roomUser.create({
          data: {
            userId: req.user.id,
            roomId: chatRoom.id,
          },
        });
        const admin = await tsx.roomAdmin.create({
          data: {
            roomId: +chatRoom.id,
            userId: +req.user.id,
          }
        })
      })     
      console.log("chatroom->", chatRoom)
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
  async roomInfos(id: number) {
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

  async joinroom(userId: number, roomId: number) {
    try {
      console.log(userId, " 77 ", roomId)
      const chat = await this.prisma.chatRoom.findFirst({
        where:{
          members:{
            some:{
              id: userId,
            },
          }
        }
      })
      if(chat)
        return ;
      await this.prisma.$transaction([
        this.prisma.roomUser.create({
          data: {
            userId: +userId,
            roomId: +roomId,
          },
        }),
        this.prisma.chatRoom.update({
          where: {
            id: +roomId,
          },
          data: {
            members: {
              connect: {
                id: +userId,
              }
            },
            members_size: {increment: 1},
          }
        })
      ]);
    } catch (error) {
      console.log(error)
    }
  }
  async Blocklist(user: number) {
    const list = await this.prisma.user.findMany({
      where: {
        id: user,
      },
      select: PrismaTypes.blocklist
    })
    return [...list[0].blockedBy, ...list[0].blockedUsers];
  }
  async getroommsg(userid: number, id: number) {
    try {
      const list = await this.Blocklist(userid);
      let msg = await this.prisma.chatRoom.findFirst({
        where: {
          id: +id,
        },
        select: {
          messages: {
            where: {
              roomId: +id,
              NOT: {
                senderId: { in: list.map((user) => user.id) },
              }
            }
          },
          isdm: true,
        }
      })
      return msg.messages;
    } catch (error) {
      return [];
    }
  }

  async getUserfreindship(user1: number, user2: number) {
    try {
      const freindship = await this.prisma.friendShip.findFirst({
        where: {
          OR: [
            { AND: [{ user1: user1 }, { user2: user2 }] },
            { AND: [{ user1: user2 }, { user2: user1 }] }
          ],
        },
      })
      return freindship;
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
