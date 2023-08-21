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
import { GoogleOAuthGuard } from './guard/google-oauth.guard';
import { SELF_DECLARED_DEPS_METADATA } from '@nestjs/common/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('signin')
  @UseGuards(AuthGuard('42'))
  SignIn() { }

  @Get('callback')
  @UseGuards(AuthGuard('42'))
  async callback(@Req() req, @Res() res) {
    const r = await this.authService.SignIn(req);
    await res.cookie('jwt', r.token, { 
      httpOnly: true,
      secure: true,
      // Prevents the token from being sent in cross-site requests.
    });
    res.redirect('http://localhost:5173/chat');
  }
}
@Controller("/auth/google")
export class GoogleAuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('signin')
  @UseGuards(GoogleOAuthGuard)
  SignIn() {
  }
  @Get('googleRedirect')
  @UseGuards(GoogleOAuthGuard)
  async Google_redirect(@Req() req, @Res() res) {
    const r = await this.authService.SignIn(req);
    await res.cookie("jwt", r.token);
    res.redirect("http://localhost:5173/chat");
    // console.log({redirected: r});
  }
}
