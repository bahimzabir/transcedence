import {CanActivate, ConflictException, ConsoleLogger, ExecutionContext, HttpCode, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService, PrismaTypes } from '../prisma/prisma.service';
import { ChatRoomBody, newchatdto } from './entities/chat.entity';
import {WsException } from '@nestjs/websockets';
import { chatroomRequest, joinroomdto, systemclass, userevents } from 'src/dto';
import * as argon2 from 'argon2';
import { EventsGateway } from 'src/events/events.gateway';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AuthService } from 'src/auth/auth.service';
import { dot } from 'node:test/reporters';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private event: EventsGateway,
    private schedulerRegistry: SchedulerRegistry,
    private consoleLogger : ConsoleLogger,
  ) {}
  
  async messagedontseen(id: number, roomid: number) {
    try {
      this.prisma.$transaction(async (tsx) => {
        await tsx.roomUser.updateMany({
          where:{
            AND: [{userId: id}, {roomId: roomid}]
          },
          data:{
            unreadMessage: true,
          }
        })
      })
    } catch (error) {
      this.consoleLogger.error(error)
    }
  }
  async messageSeen(id: number, roomid: number) {
    try {
      await this.prisma.$transaction(async (tsx) => {
        const r = await tsx.roomUser.updateMany({
          where:{
            AND: [{userId: id}, {roomId: roomid}]
          },
          data:{
            unreadMessage: false,
          }
        })
        const roomuser = await tsx.roomUser.findFirst({
          where:{
            userId: id,
            roomId: roomid,
          }
        })
      })
    } catch (error) {
      this.consoleLogger.error(error)
    }
  }
  async removechat(userid: number, roomid: number) {
    try {
      await this.prisma.$transaction(async (tsx) => {
        const chat = await tsx.chatRoom.findFirst({
          where: {
            id: roomid,
          },
          select: {
            roomUsers: {
              where: {
                userId: userid,
                roomId: roomid,
              },
            },
          },
        });
        if (chat) {
          if (chat.roomUsers[0].status === 'OWNER') {
            await tsx.chatRoom.delete({
              where: {
                id: roomid,
              },
            });
          } else throw new HttpException('CANT DELTE THIS ROOM ONLY OWNER CAN', 409);
        }
      });
    } catch (error) {
      throw error;
    }
  }
  async leaveroom(userid: number, roomid: number) {
    try {
      await this.prisma.$transaction(async (tsx) => {
        const chat = await tsx.chatRoom.findFirst({
          where: {
            id: +roomid,
            members: {
              some: {
                id: userid,
              },
            },
          },
          select: {
            roomUsers: {
              orderBy: {
                createdAt: 'asc',
              },
            },
            members_size: true,
          },
        });
        if (chat) {
          const rval = chat.roomUsers.find((useroom) => {
            if (useroom.userId === userid) return true;
          });
          if (rval) {
            if (rval.status === 'OWNER') {
              if (chat.members_size > 1) {
                await tsx.roomUser.update({
                  where:{
                    id: chat.roomUsers[1].id,
                  },
                  data: {
                    status: 'OWNER',
                  }
                })
              }
              else {
                this.removechat(userid, roomid);
                return true;
              }
            }
            await tsx.chatRoom.update({
              where: {
                id: +roomid,
              },
              data: {
                members: {
                  disconnect: {
                    id: +userid,
                  },
                },
                members_size: { decrement: 1 },
              },
            });
            await tsx.roomUser.delete({
              where: {
                id: rval.id,
              },
            });
          }
        } else 
          throw new HttpException('You Are Not In This Room', 404);
      });
    } catch (error) {
      throw error;
    }
  }
  async setadmin(user: number, dto: userevents) {
    try {
      await this.prisma.$transaction(async (tsx) => {
        const chat = await tsx.chatRoom.findFirst({
          where: {
            id: dto.roomid,
            AND: [
              { members: { some: { id: dto.id } } },
              { members: { some: { id: user } } },
            ],
          },
        });

        if (chat) {
          const roomuser = await tsx.roomUser.findFirst({
            where: {
              AND: [{ userId: user }, { roomId: dto.roomid }],
            },
            select: {
              status: true,
              id: true,
            },
          });
          const roomuser2 = await tsx.roomUser.findFirst({
            where: {
              AND: [{ userId: dto.id }, { roomId: dto.roomid }],
            },
            select: {
              status: true,
              id: true,
            },
          });
          if (systemclass[roomuser.status] >= systemclass['ADMIN']) {
            await tsx.roomUser.update({
              where: {
                id: roomuser2.id,
              },
              data: {
                status: 'ADMIN',
              },
            });
          }
        }
        else
          throw new Error("maybe you are not or the user not in this room")
      });
    } catch (error) {
      throw error;
    }
  }
  async mute(user: number, dto: userevents) {
    try {
      const chatroom = await this.prisma.chatRoom.findFirst({
        where: {
          id: dto.roomid,
          AND: [
            { members: { some: { id: dto.id } } },
            { members: { some: { id: user } } },
          ],
        },
        select: {
          members: true,
          mutedUser: true,
        },
      });
      if (chatroom) {
        if (this.ismuted(chatroom, dto.id))
          throw new Error('user already muted');
        const  chat = await this.prisma.chatRoom.update({
          where: {
            id: dto.roomid,
          },
          data: {
            mutedUser: {
              connect: {
                id: dto.id,
              },
            },
          },
        });
        const eventloop = setTimeout(async () => {
          await this.prisma.chatRoom.update({
            where: {
              id: dto.roomid,
            },
            data: {
              mutedUser: {
                disconnect: {
                  id: dto.id,
                },
              },
            },
          });
          this.schedulerRegistry.deleteTimeout(`${dto.id}id${dto.roomid}`);
        }, 30000); // Unmute after 1 hour
        this.schedulerRegistry.addTimeout(
          `${dto.id}id${dto.roomid}`,
          eventloop,
        );
      }
      else
        throw new Error("maybe you are not or the user not in this room")
    } 
    catch (error) {
      throw error
    }
  }
  async ban(user: number, dto: userevents) {
     await this.prisma.$transaction(async (tsx) => {
      const chatroom = await tsx.chatRoom.findFirst({
        where: {
          id: dto.roomid,
          AND: [
            { members: { some: { id: dto.id } } },
            { members: { some: { id: user } } },
          ],
        },
        select: {
          mutedUser: true,
        },
      });
      if (chatroom) {
        if (this.ismuted(chatroom, dto.id)) {
          clearTimeout(
            this.schedulerRegistry.getTimeout(`${dto.id}id${dto.roomid}`),
          );
          this.schedulerRegistry.deleteTimeout(`${dto.id}id${dto.roomid}`);
        }
        await tsx.chatRoom.update({
          where: {
            id: dto.roomid,
          },
          data: {
            members: {
              disconnect: {
                id: dto.id,
              },
            },
            members_size: { decrement: 1 },
            BannedUser: {
              connect: {
                id: dto.id,
              },
            },
          },
        });
        await tsx.roomUser.deleteMany({
          where: {
            AND: [{ userId: dto.id }, { roomId: dto.roomid }],
          },
        });
      }
      else {
        throw new Error("the user not any more in this channel")
      }
    });
  }
  async kick(user: number, dto: userevents) {
    try {
      const userstatus = await this.prisma.roomUser.findFirst({
        where: {
          AND: [{ userId: user }, { roomId: dto.roomid }],
        },
        select: {
          status: true,
        },
      });
      const kickeduser = await this.prisma.roomUser.findFirst({
        where: {
          AND: [{ userId: dto.id }, { roomId: dto.roomid }],
        },
        select: {
          status: true,
        },
      });
      if (!kickeduser)
        throw new Error('this user not any more in this channel');
      if (userstatus.status < kickeduser.status)
        throw new Error("you can't kick this user !!!!STOP PLAYING WITH ME");
      await this.prisma.$transaction(async (tsx) => {
        const chatroom = await tsx.chatRoom.findFirst({
          where:{
            id: dto.roomid,
          },
          select: {
            members: true,
            mutedUser: true,
            id: true,
          }
        
        });
        if (chatroom) {
          await tsx.chatRoom.update({
            where: {
              id: chatroom.id,
            },
            data: {
              members:{
                disconnect: {
                  id: dto.id,
                },
              },
              mutedUser: {
                disconnect: {
                  id: dto.id,
                },
              },
              members_size: { decrement: 1 },
            },
          });
          if (this.ismuted(chatroom, dto.id)) {
            clearTimeout(
              this.schedulerRegistry.getTimeout(`${dto.id}id${dto.roomid}`),
            );
            this.schedulerRegistry.deleteTimeout(`${dto.id}id${dto.roomid}`);
          }
          await tsx.roomUser.deleteMany({
            where: {
              AND: [{ userId: dto.id }, { roomId: dto.roomid }],
            },
          });
        }
      });
    } catch (error) {
      throw error;
    }
    return true;
  }
  async getchatroombyid(roomID: number) {
    try {
      const room = await this.prisma.chatRoom.findFirst({
        where: {
          id: roomID,
        },
        select: {
          members: true,
          isdm: true,
          mutedUser: true,
        },
      });
      return room;
    } catch (error) {
      return null;
    }
  }
  async getallrooms() {
    try {
      const rooms = await this.prisma.chatRoom.findMany({
        where: {
          NOT: {
            OR: [{ isdm: true }, { state: 'private' }],
          },
        },
        orderBy: {
          members: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          name: true,
          photo: true,
          members_size: true,
          state: true,
        },
      });
      return rooms;
    } catch (error) {
      console.log(error);
    }
  }
  async getroomembers(userid: number, roomID: number) {
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        id: roomID,
        members: {
          some: {
            id: userid,
          }
        }
      },
      select: {
        roomUsers: true,
        members: {
          select: {
            username: true,
            id: true,
            photo: true,
          },
        },
      },
    });
    if(!room)
      throw new HttpException("this room not availabe any more", 404);
    return room;
  }
  async getdmroominfos(id: number, sender: number) {
    const room = await this.prisma.chatRoom.findFirst({
      where: {
        id: +id,
      },
      include:{
        roomUsers:{
          where:{
              userId: sender,
          }
        }
      }
    });
    let userid: number;
    if (sender != room.senderID) userid = room.senderID;
    else userid = room.receiverID;
    const user = await this.prisma.user.findUnique({
      where: {
        id: +userid,
      },
      select: {
        username: true,
        photo: true,
      },
    });
    room.name = user.username;
    const friendship = await this.getUserfreindship(+id, +sender);
    if (friendship && friendship.status == 'BLOCKED')
      room.photo = 'unknown.jpg';
    room.photo = user.photo;
    return room;
  }
  async createdm(req, body) {
    try {
      const search = await this.prisma.chatRoom.findFirst({
        where: {
          OR: [
            {
              AND: [{ senderID: +req.user.id }, { receiverID: +body.receiver }],
            },
            {
              AND: [{ senderID: +body.receiver }, { receiverID: +req.user.id }],
            },
          ],
        },
      });
      if (search) return false;
      const chatRoom = await this.prisma.chatRoom.create({
        data: {
          isdm: true,
          senderID: +req.user.id,
          receiverID: +body.receiver,
          members: {
            connect: [{ id: req.user.id }, { id: body.receiver }],
          },
        },
      });
      const roomUser = await this.prisma.roomUser.create({
        data: {
          userId: req.user.id,
          roomId: chatRoom.id,
        },
      });
      const roomUser2 = await this.prisma.roomUser.create({
        data: {
          userId: body.receiver,
          roomId: chatRoom.id,
        },
      });
      return true;
    } catch (error) {
      console.log({
        error:
          'error occured when trying create adm between id ' +
          req.user.id +
          ' and ' +
          body.receiver,
      });
      return false;
    }
  }

  async createChatRoom(req, body: newchatdto) {
    try {
      let chatRoom;
      await this.prisma.$transaction(async (tsx) => {
        chatRoom = await tsx.chatRoom.create({
          data: {
            name: body.name,
            members: {
              connect: {
                id: req.user.id,
              },
            },
            members_size: 1,
            state: body.status,
            password: body.password ? await argon2.hash(body.password) : '',
          },
        });
        await tsx.chatRoom.update({
          where: {
            id: chatRoom.id,
          },
          data: {
            photo: '/images/' + chatRoom.id + 'room.png',
          },
        });
        const roomUser = await tsx.roomUser.create({
          data: {
            userId: req.user.id,
            roomId: chatRoom.id,
            status: 'OWNER',
          },
        });
      });
      return chatRoom;
    } catch (error) {
      throw new Error('error occured while creating chat room');
    }
  }

  getUserJwt(token: string){
    const Decoded = jwt.verify(token, this.config.get('JWT_SECRET'));
    return Decoded;
  }

  async create(createMessageDto: CreateChatDto, sender: number) {
    const id: number = +createMessageDto.id;
    const message = await this.prisma.message.create({
      data: {
        content: createMessageDto.message,
        senderId: sender,
        roomId: id,
      },
    });
    await this.prisma.chatRoom.update({
      where: {
        id: id,
      },
      data: {
        updatedAt: message.createdAt,
      },
    });
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
                },
              },
            },
          },
          roomUsers: {
            select: {
              user: {
                select: {
                  id: true,
                  username: true,
                  photo: true,
                },
              },
              status: true,
            },
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
        roomUsers: {
          select: {
            status: true,
          },
        },
      },
    });
    return room;
  }
  async isprotected(roompassword: string, password: string): Promise<boolean> {
    const isMatch = await argon2.verify(roompassword, password);
    if (isMatch) return true;
    else false;
  }
  async forcejoining(userId: number, roomid: number)
  {
    try{
      await this.prisma.$transaction(async (tsx)=>{
        const chatroom = await tsx.chatRoom.findFirst({
          where: {
            id: roomid,
          },
          select: {
            members:{
              where:{
                id: userId,
              }
            },
            id: true,
          }
        })
        if(chatroom){
          if(chatroom.members.length)
            throw HttpStatus.CONFLICT
          await this.prisma.chatRoom.update({
            where:{
              id: roomid,
            },
            data:{
              members: {
                connect:{
                  id: userId,
                },
              },
              members_size: {increment:1}
            }
          })
          await this.prisma.roomUser.create({
            data:{
              userId: userId,
              roomId: chatroom.id,
            }
          })
        }
        else
          throw HttpStatus.CONFLICT
        return HttpStatus.OK
      })
    }
    catch(error) {
      throw new ConflictException("user already exists")
    }
  }
  async joinroom(userId: number, body: joinroomdto) {
    try {
      const chat = await this.prisma.chatRoom.findFirst({
        where: {
          id: +body.id,
          NOT: {
            members: {
              some: {
                id: +userId,
              },
            },
          },
        },
        select: {
          members: true,
          state: true,
          password: true,
          BannedUser: {
            where: {
              id: userId,
            }
          }
        },
      });
      if (!chat) {
        throw new HttpException('you are already in this room', 404);
      }
      if(chat.BannedUser.length)
        throw new HttpException('you are banned from this room', 404);
      if (chat.state === 'protected') {
          if(!(await this.isprotected(chat.password, body.password)))
              throw new HttpException('wrongpassword', 404);
      }
      await this.prisma.$transaction([
        this.prisma.roomUser.create({
          data: {
            userId: +userId,
            roomId: +body.id,
          },
        }),
        this.prisma.chatRoom.update({
          where: {
            id: +body.id,
          },
          data: {
            members: {
              connect: {
                id: +userId,
              },
            },
            members_size: { increment: 1 },
          },
        }),
      ]);
      return HttpStatus.OK;
    } catch (error) {
      throw error
    }
  }

  async Blocklist(user: number) {
    const list = await this.prisma.user.findMany({
      where: {
        id: user,
      },
      select: PrismaTypes.blocklist,
    });
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
              },
            },
          },
          isdm: true,
        },
      });
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
            { AND: [{ user1: user2 }, { user2: user1 }] },
          ],
        },
      });
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

  async remove(userid: number, id: number) {
    try {
      this.prisma.$transaction(async (tsx) => {
        const chatroom = await this.prisma.chatRoom.findFirst({
          where: {
            id: id,
            members: {
              some: {
                id: userid,
              },
            },
          },
          select: {
            members: true,
          },
        });
        if (chatroom) {
          const roomuser = await tsx.roomUser.findFirst({
            where: {
              AND: [{ userId: userid }, { roomId: id }],
            },
            select: {
              status: true,
              id: true,
            },
          });
          if (roomuser.status === 'OWNER') {
            await tsx.chatRoom.delete({
              where: {
                id: id,
              },
            });
          }
        }
      });
    } catch (error) {
      return new WsException('error occured while deleting chat room');
    }
  }
  ismuted(room: any, id: number) {
    if (room.mutedUser === undefined) return false;
    if (room.mutedUser.find((muted) => muted.id === id)) return true;
    return false;
  }
  isexist(room: any, id: number) {
    if (room && room.members.find((user) => user.id === id)) return true;
    return false;
  }
}


@Injectable()
export class JwtWebSocketGuard implements CanActivate {
  constructor(private authService: AuthService) {
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.headers.cookie.split('jwt=')[1]; // Extract the token from the WebSocket handshake query
    if (!token) {
      return false;
    }
    try{    
    const user = await this.authService.verifyToken(token);
    if (!user) {
      return false;
    }

    client.user = user; // Attach the user to the WebSocket client object
    return true;
    }
    catch(error) {
      return false;
    }
    
    
  }
}