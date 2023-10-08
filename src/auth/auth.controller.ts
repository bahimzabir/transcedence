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
import { PrismaService } from 'src/prisma/prisma.service';

// get redirect url 

const redirectUrl = async (prisma: PrismaService, req: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email
      },
    });
    if (user) {
      return "http://localhost:5173/home";
    } else {
      return "http://localhost:5173/profile";
    }
  } catch (error) {
    return "http://localhost:5173/profile";
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private prisma: PrismaService) { }

  @Get('signin')
  @UseGuards(AuthGuard('42'))
  SignIn() { }

  @Get('callback')
  @UseGuards(AuthGuard('42'))
  async callback(@Req() req, @Res() res) {
    const url = await redirectUrl(this.prisma, req);
    const r = await this.authService.SignIn(req);
    await res.cookie('jwt', r.token, {
        domain: 'localhost', // Set to your domain
        path: '/',
        httpOnly: true,
        secure: true, // Set to true for HTTPS
        //sameSite: 'Lax', // Adjust based on your requirements
    });
    res.redirect(url);
  }
}
@Controller("/auth/google")
export class GoogleAuthController {
  constructor(private readonly authService: AuthService, private prisma: PrismaService) { }

  @Get('signin')
  @UseGuards(GoogleOAuthGuard)
  SignIn() {
  }
  @Get('googleRedirect')
  @UseGuards(GoogleOAuthGuard)
  async Google_redirect(@Req() req, @Res() res) {
    const url = await redirectUrl(this.prisma, req);
    const r = await this.authService.SignIn(req);
    await res.cookie("jwt", r.token , {
      httpOnly: true,
      secure: true,
    })
    res.redirect(url);
    // console.log({redirected: r});
  }
}
