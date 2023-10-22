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
import { ConfigService } from '@nestjs/config';

// get redirect url
const redirectUrl = async (prisma: PrismaService, req: any) => {
  const config = new ConfigService;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
    });
    if (user) {
      return `${config.get("HOST")}/home`;
    } else {
      return `${config.get("HOST")}/profile`;
    }
  } catch (error) {
    return `${config.get("HOST")}/profile`;
  }
}

@Controller('auth')
export class AuthController {
  constructor(private config: ConfigService, private readonly authService: AuthService, private prisma: PrismaService) { }


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
    const r = await this.authService.SignIn(req);
    await res.cookie('jwt', r.token, {
        path: '/',
        httpOnly: true,
    });
    // if two factor is enabled
    if (r.user.isTwoFactorAuthEnabled) {
      res.redirect(`${this.config.get("HOST")}/verify`);
    } else {
      res.redirect(url);
    }
  }
}
@Controller('/auth/google')
export class GoogleAuthController {
  constructor(private config: ConfigService, private readonly authService: AuthService, private prisma: PrismaService) { }

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
    if (r.user.isTwoFactorAuthEnabled) {
      res.redirect(`${this.config.get("HOST")}/verify`);
    } else {
      res.redirect(url);
    }
  }
}


// @UseGuards(JwtGard)
@UseGuards(JwtTwoFactorGuard)
@Controller('logout')
export class LogoutController {
  constructor(
    private config: ConfigService,
    private readonly authService: AuthService,
    private readonly events: EventsGateway,
  ) {}
  @Get()
  async Logout(@Req() req, @Res() res) {
    this.events.closeOnlineUsers(req.user.id);
    await res.clearCookie('jwt');
    await this.events.handleDisconnect(req.user.id);

    res.redirect(`${this.config.get("HOST")}`);
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
    return request.user;
  }
  @UseGuards(JwtGard)
  @Post('generate') //! generatin qr code and puthing teh secret key in db
  async register(@Req() request: RequestWithUser) {
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
  }

  @UseGuards(JwtGard)
  @Post('turn-on') //! hadi bayna kat turniha 
  @HttpCode(201)
  //! use jwt guard hereJwtTwoFactorGuard
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    @Body() body: any,
  ) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.code,
      request.user,
    );
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }
    await this.authService.turnOnTwoFactorAuthentication(request.user.id);
    return this.authService.createCookie(request);
  }

  @Post('turn-off') //! hadi bayna kat turniha off
  @UseGuards(JwtTwoFactorGuard)
  @HttpCode(201)
  async turnOffTwoFactorAuthentication(
    // @Res() res: Response,
    @Req() request: RequestWithUser,
    @Body() body: any,
  ) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.code,
      request.user,
    );
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }
    await this.authService.turnOffTwoFactorAuthentication(request.user.id);
    return this.authService.createCookie(request);
  }

  @UseGuards(JwtGard)
  @Post('authenticate')
  @HttpCode(201)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() body: any,
  ) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.code,
      request.user,
    );
    console.log(isCodeValid);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return await this.authService.createCookie(request);
  }
}
