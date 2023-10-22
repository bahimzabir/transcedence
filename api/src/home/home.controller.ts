import { Body, Controller, Get, Post, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtGard } from 'src/auth/guard';
import JwtTwoFactorGuard from 'src/auth/guard/jwt-two-factor.guard';

@UseGuards(JwtTwoFactorGuard)
@Controller()
export class HomeController {
  @Get(['/', '/home'])
  home(@Req() req: any) {
    //console.log({ homereq: req.user });
    //console.log({ homecookies: req.cookies });
    return 'Welcome Home!';
  }

  @Post(['/', '/home'])
  ispost(@Req() req: any, @Body() body: Body) {
    console.log({ homereq: req.user });
    console.log({ homebody: body });
    return 'Welcome Home!';
  }
  @Post()
  postHome(@Req() req: any, @Body() body: any) {
    console.log({body: body});
    console.log({req: req.body});
    console.log("Post Home");
  }
}
