import { Controller, Get, Req, Post, UseGuards, Body, Query, Param } from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { UserService } from './user.service';
import { UserUpdateDto } from 'src/dto';

@UseGuards(JwtGard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  getUser(@Req() req: any) {
    return req.user;
  }

  @Get('me/tree')
  getUserTree(@Req() req: any) {
    return this.userService.getUserTree(req);
  }

  @Get('me/friends')
  getUserFriends(@Req() req: any) {
    return this.userService.getUserFriends(req);
  }
  @Post('me')
  editUser(@Req() req: any, @Body() body: UserUpdateDto) {
    console.log({ edituser: req.user });
    console.log({ editbody: body });
    try {
      this.userService.editUser(req, body);
      return { message: 'user updated', data: body };
    } catch (error) {
      throw error;
    }
  }
  @Get('byid')
  getUserById(@Query('id') id: number)
  {
    return this.userService.getUserbyId(id);
  }
  //search suggestion by username
  @Get('search/all')
  searchAllUser(@Req() req : Request ,@Query('squery') username: string)
  {
    return this.userService.searchAllUser(req ,username);
  }
}



