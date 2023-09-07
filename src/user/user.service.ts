import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { count } from 'console';
import { PrismaService, PrismaTypes } from 'src/prisma/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { FriendRequestDto } from 'src/dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private event: EventsGateway) { }
  async editUser(req: any, body: any) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          username: body.username,
          bio: body.bio,
          photo: body.photo,
        },
      });
    } catch (error) {
      throw new Error('error occured while updating user');
    }
  }

  // get user friends
  async getUserFriends(req: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: PrismaTypes.UserFriendSelect,
      });
      // this.event.hanldleSendNotification(req.user.id, "hello world");
      return user;
    } catch (error) {
      throw new Error('error occured while getting user friends');
    }
  }

  async getUserTree(req: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        include: {
          notifications: true,
          friends: { select: PrismaTypes.UserFriendSelect },
          outgoingFriendRequests: true,
          incomingFriendRequests: true,
          blockedUsers: true,
          blockedBy: true,
          roomUsers: { select: PrismaTypes.roomUserSelect },
          roomAdmins: { select: PrismaTypes.roomUserSelect },
        },
      });
      return user;
    } catch (error) {
      throw new Error('error occured while getting user tree');
    }
  }

  async getUserbyId(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: +id,
        },
        select: PrismaTypes.UserBasicIfosSelect,
      });
      return user;
    } catch (error) {
      //console.log(error);
      throw new Error('error occured while getting user trees');
    }
  }

  async sendFriendRequest(req: any, body: FriendRequestDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          outgoingFriendRequests: {
            where: {
              receiver: {
                id: body.receiver,
              },
            },
          },
        },
      });
      if (user.outgoingFriendRequests.length > 0) {
        throw new HttpException(
          'Friend request already sent',
          HttpStatus.CONFLICT,
        );
      }
      const friendRequest = await this.prisma.friendRequest.create({
        data: {
          sender: {
            connect: {
              id: req.user.id,
            },
          },
          receiver: {
            connect: {
              id: body.receiver,
            },
          },
        },
      });
      return friendRequest;
    }
    catch (error) {
     return error;
      // throw new Error('error occured while sending friend request');
    }
  }

  async searchAllUser(req: any, username: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [ // search by username
            {
              username: {
                contains: username,
                mode: 'insensitive',
              },
            },
            // search by firstname
            {
              firstname: {
                contains: username,
                mode: 'insensitive',
              },
            },
            // search by lastname
            {
              lastname: {
                contains: username,
                mode: 'insensitive',
              },
            },
          ],
          //exclude blocked users
          NOT: {
            OR: [
              {
                id: req.user.id,
              },
              {
                blockedBy: {
                  some: {
                    id: req.user.id,
                  },
                },
              },
              {
                blockedUsers: {
                  some: {
                    id: req.user.id,
                  },
                },
              },
            ],
          },
        },
        select: PrismaTypes.UserBasicIfosSelect,
      });
      return users;
    } catch (error) {
      throw new Error('error occured while searching user');
    }
  }

  async getallchatrooms(id: number) {
    try {
      const chatrooms = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          roomUsers: { select: PrismaTypes.roomUserSelect },
        },
      });
      return chatrooms.roomUsers;
    }
    catch (error) {

    }
  }
  async getUserinfos(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        select: PrismaTypes.UserBasicIfosSelect,
      })
      return user;
    } catch (error) {
      console.log(error)
    }
  }
}
