import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { count } from 'console';
import { PrismaService, PrismaTypes } from 'src/prisma/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';
import { ConfigService } from '@nestjs/config';
import { FriendStatus, Prisma } from '@prisma/client';
import { FillRequestDto, FriendRequestDto } from 'src/dto';
import { create } from 'domain';
import { Http2ServerResponse } from 'http2';



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
          firstname: body.firstname,
          lastname: body.lastname,
        },
      });
    } catch (error) {
      throw new HttpException("database engine can't update the entity requested", HttpStatus.NOT_FOUND);
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
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
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
        },
      });
      return user;
    } catch (error) {
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }

  async getNotifications(req: any) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          user: {
            id: req.user.id,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return notifications;
    } catch (error) {
      throw new HttpException("database engine can't find the entities requested", HttpStatus.NOT_FOUND);
    }
  };


  async readNotification(req: any, ids: number[]) {
    const count = ids.length;
    const intIds = ids.map((id) => +id);
    console.log(ids);
    try {
      const notifications = await this.prisma.notification.updateMany({
        where: {
          id: {
            in: intIds,
          },
        },
        data: {
          read: true,
        },
      });
      await this.prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          pendingnotifications: { decrement: count },
        },
      });
      return notifications;
    } catch (error) {
      throw new HttpException("database engine can't find the entities requested", HttpStatus.NOT_FOUND);
    }
  }

  async deleteNotification(req: any, ids: number[]) {
    // convert all ids to number
    const intIds = ids.map((id) => +id);
    console.log(+ids);
    try {
      const notifications = await this.prisma.notification.deleteMany({
        where: {
          id: {
            in: intIds,
          },
        },
      });
      return notifications;
    } catch (error) {
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }


  async getUserbyId(req: any, id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: +id,
          NOT: {
            blockedUsers: {
              some: {
                id: req.user.id,
              },
            },
          },
        },
        select: PrismaTypes.UserBasicIfosSelect,
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const friendShip = await this.prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          outgoingFriendRequests: {
            where: {
              receiver: {
                id: +id,
              },
            },
          },
          incomingFriendRequests: {
            where: {
              sender: {
                id: +id,
              },
            },
          },
        },
      })
      return {
        user, friendShip: {
          recieved: friendShip.incomingFriendRequests[0],
          sent: friendShip.outgoingFriendRequests[0],
        }
      };
    } catch (error) {
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }

  async getBlockedUsers(userid: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userid,
        },
        select: {
          blockedUsers: { select: PrismaTypes.BlockedIfosSelect },
        },
      });
      return user;
    } catch (error) {
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }

  async blockUser(req: any, id: number) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          blockedUsers: {
            connect: {
              id: +id,
            },
          },
          outgoingFriendRequests: {
            deleteMany: {
              receiverId: +id,
            },
          },
          incomingFriendRequests: {
            deleteMany: {
              senderId: +id,
            },
          },
        },
        select: { blockedUsers: { select: PrismaTypes.BlockedIfosSelect } },
      })
      const dm = await this.prisma.chatRoom.findFirst({
        where: {
          OR: [
            {AND: [ {senderID: +id},{receiverID: +req.user.id }]},
            {AND: [ {senderID: +req.user.id},{receiverID: +id }]}
          ]
        }
      })
      await this.prisma.chatRoom.delete({
        where:{
          id: dm.id,
        }
      })
      await this.prisma.friendShip.create({
        data:{
          user1: +req.user.id,
          user2: +id,
          status: "BLOCKED"
        }
      })
      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }

  async unblockUser(req: any, id: number) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          blockedUsers: {
            disconnect: {
              id: +id,
            },
          },
        },
        select: { blockedUsers: { select: PrismaTypes.BlockedIfosSelect } },
      })
      return user;
    } catch (error) {
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }


  async sendFriendRequest(req: any, body: FriendRequestDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: req.user.id,
          NOT: {
            OR: [
              {
                blockedUsers: {
                  some: {
                    id: body.receiver,
                  },
                }
              }, {
                blockedBy: {
                  some: {
                    id: body.receiver,
                  },
                },
              }
            ]

          },
        },
        select: {
          outgoingFriendRequests: {
            where: {
              receiver: {
                id: body.receiver,
              },
            },
          },
          incomingFriendRequests: {
            where: {
              sender: {
                id: body.receiver,
              },
            },
          },
          ...PrismaTypes.UserBasicIfosSelect,
        },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      if (user.outgoingFriendRequests.length > 0) {
        throw new HttpException(
          'Friend request already sent to this user',
          HttpStatus.CONFLICT,
        );
      }
      if (user.incomingFriendRequests.length > 0) {
        throw new HttpException(
          'Friend request already recieved from this user',
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
          status: FriendStatus.PENDING,
        },
      });
      // this.event.hanldleSendNotification(body.receiver, req.user.id, {
      //   type: "friendrequestrecieved", from: user, message: `${user.username} sent you a friend request`
      // });
      return friendRequest;
    }
    catch (error) {
      throw new HttpException("database engine can't create the entity requested", HttpStatus.NOT_FOUND);
    }
  }

  async fillFriendRequest(req: any, body: FillRequestDto) {
    try {
      let friendRequest : any;
      if (body.response) {
        friendRequest = await this.prisma.friendRequest.update({
          where: {
            id: body.id,
            receiverId: req.user.id,
          },
          data: {
            status: FriendStatus.FRIEND,
          },
        });
        console.log({friendRequest}, {len: friendRequest.length})
        if (friendRequest) {
          const user = await this.prisma.user.update({
            where: {
              id: req.user.id,
            },
            data: {
              friends: {
                connect: {
                  id: friendRequest.senderId,
                },
              },
              friendOf: {
                connect: {
                  id: friendRequest.senderId,
                },
              },
            },
            select: PrismaTypes.UserBasicIfosSelect,
          });
          // this.event.hanldleSendNotification(friendRequest.senderId, req.user.id, {
          //   type: "friendrequestaccepted", from: user, message: `${user.username} accepted your friend request`
          // });
        } else {
          return new HttpException("friend request not found", HttpStatus.NOT_FOUND);
        }
      } else {
        friendRequest = await this.prisma.friendRequest.delete({
          where: {
            id: body.id,
          },
        });
      }
      //console.log(friendRequest);
      return friendRequest;
    } catch (error) {
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }

  async cancelFriendRequest(req: any, body: FillRequestDto) {
    try {
      const friendreq = await this.prisma.friendRequest.delete({
        where: {
          id: body.id,
          senderId: req.user.id,
          status: FriendStatus.PENDING
        },
      })
      if (friendreq) {
        return (friendreq)
      } else {
        return new HttpException('Pending friend request not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException("database engine can't delete the entity requested", HttpStatus.NOT_FOUND);
    }
  }

  async getFriendRequests(req: any) {
    try {
      const friendRequest = await this.prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          incomingFriendRequests: true,
          outgoingFriendRequests: true,
        },
      });
      return friendRequest;
    } catch (error) {
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
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
      throw new HttpException("database engine can't find the entities requested", HttpStatus.NOT_FOUND);
    }
  }

  async getallchatrooms(id: number) {
    try {
      const chatrooms = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          chats: true,
        },
      });
      return chatrooms.chats;
    }
    catch (error) {
      throw new HttpException("database engine can't find the entities requested", HttpStatus.NOT_FOUND);
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
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }

  // get user games
  async getUserGames(id: number) {
    try {
      const games = await this.prisma.user.findUnique({
        where: {
          id: +id
        },
        select: {
          games: true,
        }
      });
      return (games);
    } catch (error) {
      throw new HttpException("database engine can't find the entity requested", HttpStatus.NOT_FOUND);
    }
  }

}
