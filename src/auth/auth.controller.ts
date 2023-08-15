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
    res.cookie('jwt', r.token, {
      httpOnly: true, // Ensures that the token cannot be accessed via JavaScript.
      secure: true, // Ensures the token is only sent over HTTPS if available.
      sameSite: 'strict', // Prevents the token from being sent in cross-site requests.
    });
    console.log(r.token);
    res.redirect('http://localhost:3000/home');
    console.log({ redirected: r });
  }
}
@Controller("/auth/google")
export class GoogleAuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('signin')
    @UseGuards(GoogleOAuthGuard)
    SignIn(){
    }
    @Get('googleRedirect')
    @UseGuards(GoogleOAuthGuard)
    async Google_redirect(@Req() req, @Res() res){
        const r = await this.authService.SignIn(req);
        res.cookie("jwt", r.token, {
            httpOnly: true, // Ensures that the token cannot be accessed via JavaScript.
            secure: true, // Ensures the token is only sent over HTTPS if available.
            sameSite: "strict", // Prevents the token from being sent in cross-site requests.
          });
        // console.log(r.token);
        console.log(req)
        res.redirect("http://localhost:5173/chat");
        // console.log({redirected: r});
    }
}
