import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { AuthService } from './auth.service';
import { AuthDto } from 'src/dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOAuthGuard } from './guard/google-oauth.guard';
import { SELF_DECLARED_DEPS_METADATA } from '@nestjs/common/constants';
import RequestWithUser from './interfaces/requestWithUser.interface';
import { Response, response } from 'express';
import { EventsGateway } from 'src/events/events.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { FillRequestDto, FriendRequestDto, UpdateNotificationsDto, UserUpdateDto, TwoFactorAuthenticationCodeDto,  } from 'src/dto';
import { use } from 'passport';
import JwtTwoFactorGuard from './guard/jwt-two-factor.guard';
import * as qrcode from 'qrcode';

// get redirect url
const redirectUrl = async (prisma: PrismaService, req: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
    });
    if (user) {
      return 'http://localhost:8000/home';
    } else {
      return 'http://localhost:8000/profile';
    }
  } catch (error) {
    return 'http://localhost:8000/profile';
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private prisma: PrismaService) { }


  @Get('verify')
  @UseGuards(JwtTwoFactorGuard)
  async verify() {
    return 'TRUE';
  }
  @Get('Jwtverify')
  @UseGuards(JwtGard)
  async Jwtverify() {
    return 'TRUE';
  }

  @Get('signin')
  @UseGuards(AuthGuard('42'))
  SignIn() {
  }

  @Get('callback')
  @UseGuards(AuthGuard('42'))
  async callback(@Req() req, @Res() res) {
    const url = await redirectUrl(this.prisma, req);
    console.log(url);
    const r = await this.authService.SignIn(req);
    await res.cookie('jwt', r.token, {
        domain: 'localhost', // Set to your domain
        path: '/',
        httpOnly: true,
        secure: true, // Set to true for HTTPS
        //sameSite: 'Lax', // Adjust based on your requirements
    });
    // if two factor is enabled
    if (r.user.isTwoFactorAuthEnabled) {
      res.redirect('http://localhost:8000/verify');
    } else {
      res.redirect(url);
    }
  }
}
@Controller('/auth/google')
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
    await res.cookie('jwt', r.token , {
      httpOnly: true,
      secure: true,
    });
    res.redirect(url);
    // console.log({redirected: r});
  }
}


// @UseGuards(JwtGard)
@UseGuards(JwtTwoFactorGuard)
@Controller('logout')
export class LogoutController {
  constructor(
    private readonly authService: AuthService,
    private readonly events: EventsGateway,
  ) {}
  @Get()
  async Logout(@Req() req, @Res() res) {
    this.events.closeOnlineUsers(req.user.id);
    await res.clearCookie('jwt');
    await this.events.handleDisconnect(req.user.id);

    res.redirect('http://localhost:8000/');
  }
}

@Controller('2fa')
// @UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}
  //! this function is for debugging purposes but the whole controller is not working
  @Get()
  a(@Req() request: RequestWithUser) {
    // console.log({ request });
    console.log('helldo');
    return request.user;
  }
  @UseGuards(JwtGard)
  @Post('generate') //! generatin qr code and puthing teh secret key in db
  //! use jwt guard here
  async register(@Req() request: RequestWithUser) {
    console.log('user.eamil');
    console.log(request.user.email);
    const otpauthUrl =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user,
      );
      try {
        const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);
        return qrCodeDataURL;
      } catch (error) {
        throw new Error('Failed to generate QR code.');
      }
      // console.log('[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[')
    // console.log(Qrcode);
    // return Qrcode;
    // console.log(qrCodeDataURL);
    // return `<img src="${qrCodeDataURL}" alt="QR Code" />`;
    // return this.authService.pipeQrCodeStream(response, otpauthUrl);
  }

  @UseGuards(JwtGard)
  @Post('turn-on') //! hadi bayna kat turniha 
  @HttpCode(200)
  //! use jwt guard here
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    @Body() body: any,
  ) {
    console.log(body.code);
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.code,
      request.user,
    );
    console.log(isCodeValid);
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }
    console.log('true000000000000000000000000000000000000000000000000000000000');
    await this.authService.turnOnTwoFactorAuthentication(request.user.id);
  }

  @Post('turn-off') //! hadi bayna kat turniha of
  // @UseGuards(JwtTwoFactorGuard)
  @HttpCode(200)
  //! use jwt guard here
  async turnOffTwoFactorAuthentication(
    @Res() res: Response,
    @Req() request: RequestWithUser,
  ) {
    console.log(request.user);
    await this.authService.turnOffTwoFactorAuthentication(request.user.id);
    res.redirect('http://localhost:8000/');
    // response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());

  }

  @UseGuards(JwtGard)
  @Post('authenticate') //
  @HttpCode(200)
  //! use jwt guard here
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() twoFactorAuthenticationCode: string,
    setCookies = true,
  ) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      request.user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const accessTokenCookie = this.authService.generateToken(
      request.user,
      true,
    );
    if (setCookies) {
      // request.res.setHeader('Set-Cookie', [accessTokenCookie]);
      await request.res.cookie('jwt', accessTokenCookie, {
        httpOnly: true,
        secure: true,
      });
    }
    return request.user;
  }
}
