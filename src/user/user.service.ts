import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
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
      throw new Error('error occured while getting user tree');
    }
  }
  async getUserbyId(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
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
      throw new Error('error occured while getting user tree');
    }
  }
}
