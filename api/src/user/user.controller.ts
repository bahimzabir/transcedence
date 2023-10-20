import { Controller, Get, Req, Post, UseGuards, Body, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { UserService } from './user.service';
import { FillRequestDto, FriendRequestDto, UpdateNotificationsDto, UserUpdateDto } from 'src/dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import JwtTwoFactorGuard from 'src/auth/guard/jwt-two-factor.guard';
@UseGuards(JwtGard)
@Controller('test')
export class TestController {
  constructor(private readonly userService: UserService) { }
  @Get('me')
  getUser(@Req() req: any) {
    return req.user;
  }

  @Get('test')
  test() {
    return "test success !";
  }
  @Get('me/tree')
  getUserTree(@Req() req: any) {
    return this.userService.getUserTree(req);
  }
}

@UseGuards(JwtTwoFactorGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('uss')
  getUss(@Req() req: any) {
    return req.user;
  }

  @Get('me')
  getUser(@Req() req: any) {
    console.log('req.user', req.user);
    return req.user;
  }


  // get 2fa status
  @Get('tfastatus')
  getTfaStatus(@Req() req: any) {
    return req.user.isTwoFactorAuthEnabled
  }

  @Get('me/tree')
  getUserTree(@Req() req: any) {
    return this.userService.getUserTree(req);
  }

  @Get('me/friends')
  getUserFriends(@Req() req: any) {
    return this.userService.getUserFriends(req);
  }

  @Get('byid')
  getUserById(@Req() req: any, @Query('id') id: number) {
    return this.userService.getUserbyId(req, id);
  }
  //search suggestion by username
  @Get('search/all')
  searchAllUser(@Req() req : Request ,@Query('query') username: string) {
    return this.userService.searchAllUser(req ,username);
  }
  @Get('me/chatrooms')
  getAllchatRooms(@Req() req) {
    return this.userService.getallchatrooms(req.user.id);
  }

  @Get('chatrooms')
  async getAllchatRoomsId(@Query('id') id:number) {
    return this.userService.getallchatrooms(id);
  }
  @Get('me/friendrequests')
  getFriendRequests(@Req() req) {
    return this.userService.getFriendRequests(req);
  }
  
  @Get('userinfos')
  getUserinfo(@Query("id") id: number){
      return this.userService.getUserinfos(+id);
  }

  @Get('me/blocklist')
  getBlockList(@Req() req) {
    return this.userService.getBlockedUsers(req.user.id);
  }

  @Get('me/getnotifications')
  getNotifications(@Req() req) {
    return this.userService.getNotifications(req);
  }

  @Get('usergames')
  getUserGames(@Query("id") id: number) {
    return this.userService.getUserGames(id);
  }


  // Post requests
  @Post('me')
  @UseGuards(JwtGard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination:'/app/src/img',
        filename: (req: any, file, callback) => {
          const originalName = file.originalname;
          const newName = req.user.id + ".png"
          callback(null, newName);
        },
      }),
    }),
  )
  async editUser(@Req() req: any, @Body('body') bodyString: string, @UploadedFile() file: Express.Multer.File) {
    try {
      console.log('body string', bodyString)
      const parsedBody = JSON.parse(bodyString);
      const body = plainToClass(UserUpdateDto, parsedBody);
      console.log('body: ', body);
      if (body.fullname) {
        const words = body.fullname.split(' ')
        if (words.length !== 2) {
          throw new BadRequestException('Invalid Fullname')
        }
      }
      const errors = await validate(body);
      if (errors.length > 0) {
        console.log(errors)
        throw new BadRequestException('Validation failed');
      }
      await this.userService.editUser(req, body);
      return { message: 'user updated', data: body };
    } catch (error) {
      console.log(' error ', error)
      throw error;
    }
  }

  @Post('block')
  blockUser(@Req() req: any, @Body('id') id: number) {
    return this.userService.blockUser(req, id);
  }

  @Post('unblock')
  unblockUser(@Req() req: any, @Body('id') id: number) {
    return this.userService.unblockUser(req, id);
  }

  @Post('/sendfriendrequest')
  sendFriendRequest(@Req() req: any, @Body() body: FriendRequestDto) {
    return this.userService.sendFriendRequest(req, body);
  }

  @Post('/fillfriendrequest')
  fillFriendRequest(@Req() req: any, @Body() body: FillRequestDto) {
    return this.userService.fillFriendRequest(req, body);
  }

  @Post('/cancelfriendrequest')
  cancelFriendRequest(@Req() req: any, @Body() body: FillRequestDto) {
    return this.userService.cancelFriendRequest(req, body);
  }

  @Post('/removefriend')
  removeFriend(@Req() req: any, @Body() body: FillRequestDto) {
    return this.userService.removeFriend(req, body);
  }


  @Post('readnotification')
  readNotification(@Req() req: any, @Body() body: UpdateNotificationsDto) {
    return this.userService.readNotification(req, body.id);
  }

  @Post('deletenotification')
  deleteNotification(@Req() req: any, @Body() body: UpdateNotificationsDto) {
    return this.userService.deleteNotification(req, body.id);
  }

  @Get('leaderboard')
  getLeaderBoard() {
    return this.userService.getLeaderBoard();
  }
}



