import { Body, Controller, Get, Post, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtGard } from 'src/auth/guard';

@UseGuards(JwtGard)
@Controller('Home')
export class HomeController {
  @Get()
  home(@Req() req: any) {
    console.log({ homereq: req.user });
    console.log({ homecookies: req.cookies });
    return 'Welcome Home!';
  }
  @Post()
  postHome(@Req() req: any, @Body() body: any) {
    console.log({body: body});
    console.log({req: req.body});
    console.log("Post Home");
  }
}
