import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from 'src/dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('signin')
  @UseGuards(AuthGuard('42'))
  SignIn() {}

  @Get('callback')
  @UseGuards(AuthGuard('42'))
  async callback(@Req() req, @Res() res) {
    const r = await this.authService.SignIn(req);
    await res.cookie('jwt', r.token, {
        domain: 'localhost', // Set to your domain
        path: '/',
        httpOnly: true,
        secure: false, // Set to true for HTTPS
        //sameSite: 'Lax', // Adjust based on your requirements
    });
    console.log(r.token);
    res.redirect('http://localhost:3000/home');
    console.log({ redirected: r });
  }
}
