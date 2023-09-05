import { Injectable, Req } from '@nestjs/common';
import { count } from 'console';
import { PrismaService } from 'src/prisma/prisma.service';
import  {EventsGateway } from 'src/events/events.gateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService  {
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
        select: {
          id: true,
          friends: {
            select: {
              id: true,
              username: true,
              photo: true,
              online: true,
            },
          },
        },
      });
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
          friends: {
            select: {
              id: true,
              username: true,
              photo: true,
              online: true,
            },
          },
          outgoingFriendRequests: true,
          incomingFriendRequests: true,
          blockedUsers: true,
          blockedBy: true,
          roomUsers: {
            select: {
              room: {
                select: {
                  id: true,
                  name: true,
                  photo: true,
                }
              }
            }
          },
          roomAdmins: {
            select: {
              room: {
                select: {
                  id: true,
                  name: true,
                  photo: true,
                }
              }
            }
          },
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
        include: {
          notifications: true,
          friends: true,
          outgoingFriendRequests: true,
          incomingFriendRequests: true,
          blockedUsers: true,
          blockedBy: true,
          roomUsers: {
            select: {
              room: {
                select: {
                  id: true,
                  name: true,
                  photo: true,
                }
              }
            }
          },
          roomAdmins: {
            select: {
              room: {
                select: {
                  id: true,
                  name: true,
                  photo: true,
                }
              }
            }
          },
        },
      });
      return user;
    } catch (error) {
      console.log(error);
      throw new Error('error occured while getting user trees');
    }
  }


  async searchAllUser(req: any, username: string) {
    //console.log(req.user.username);
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
        select: {
          id: true,
          firstname: true,
          lastname: true,
          username: true,
          photo: true,
          online: true,
        },
      });
      return users;
    } catch (error) {
      throw new Error('error occured while searching user');
    }
  }

  async getallchatrooms(id:number)
  {
    try{
      const chatrooms = await this.prisma.user.findUnique({
        where:{
          id: id,
        },
        select: {
          roomUsers: {
            select: {
              room: {
                select: {
                  id: true,
                  name: true,
                  photo: true,
              },
            },
          },            
        },
      },
    });
      return chatrooms.roomUsers;
    }
    catch (error) {
     
    }
  }
}
