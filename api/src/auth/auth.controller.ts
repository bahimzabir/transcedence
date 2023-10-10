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

// get redirect url 

const redirectUrl = async (prisma: PrismaService, req: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email
      },
    });
    if (user) {
      return "http://localhost:8000/home";
    } else {
      return "http://localhost:8000/profile";
    }
  } catch (error) {
    return "http://localhost:8000/profile";
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
    console.log(url);
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
    });
    res.redirect(url);
    // console.log({redirected: r});
  }
}

@UseGuards(JwtGard)
@Controller("logout")
export class LogoutController {
  constructor(
    private readonly authService: AuthService,
    private readonly events: EventsGateway,
  ) {}
  @Get()
  async Logout(@Req() req, @Res() res) {

    // what if the user saved his token?
    await res.clearCookie("jwt");
    // set the user to offline
    //! close all sockets
    await this.events.handleDisconnect(req.user.id);

    res.redirect("http://localhost:8000/");
  }
}

@UseGuards(JwtGard)
@Controller('2fa')
// @UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(private readonly authService: AuthService) {}
  //! this function is for debugging purposes but the whole controller is not working
  @Get()
  a(@Req() request: RequestWithUser) {
    // console.log({ request });
    console.log("helldo");
    return request.user;
  }

  @Post('generate') //! generatin qr code and puthing teh secret key in db
  //! use jwt guard here
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    // console.log({ request });
    const { otpauthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user,
      );
    return this.authService.pipeQrCodeStream(response, otpauthUrl);
  }

  @Post('turn-on') //! hadi bayna kat turniha 
  @HttpCode(200)
  //! use jwt guard here
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    // @Body() twoFactorAuthenticationCode: string,
  ) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      request.body.twoFactorAuthenticationCode,
      request.user,
    );
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }
    await this.authService.turnOnTwoFactorAuthentication(request.user.id);
  }

  @Post('turn-off') //! hadi bayna kat turniha of
  // @UseGuards()
  @HttpCode(200)
  //! use jwt guard here
  async turnOffTwoFactorAuthentication(
    @Res() res: Response,
    @Req() request: RequestWithUser,
  ) {
    console.log(request.user);
    await this.authService.turnOffTwoFactorAuthentication(request.user.id);
    await res.cookie(
      "jwt",
      this.authService.generateToken(request.user),
    {
      httpOnly: true,
      secure: true,
    });
    res.redirect("http://localhost:8000/profile");
    // response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());

  }

  @Post('authenticate') //
  @HttpCode(200)
  //! use jwt guard here
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
    setCookies = true,
  ) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      request.user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
      true,
    );
    if (setCookies) {
      request.res.setHeader('Set-Cookie', [accessTokenCookie]);
    }
    return request.user;
  }
}
