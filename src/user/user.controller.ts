import { Controller, Get, Req, Post, UseGuards, Body } from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { UserService } from './user.service';

@UseGuards(JwtGard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  getUser(@Req() req: any) {
    return req.user;
  }

  //edit user infos
  @Post('me')
  editUser(@Req() req: any, @Body() body: Body) {
    console.log({ edituser: req.user });
    console.log({ editbody: body });
    try {
      this.userService.editUser(req, body);
    } catch (error) {
      throw error;
    }
  }
}
