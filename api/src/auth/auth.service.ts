import { Injectable, Body } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import * as path from 'path'
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { UserTfaDto } from 'src/dto/all.dto';
import TokenPayload from './interfaces/tokenPayload.interface';
import RequestWithUser from './interfaces/requestWithUser.interface';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    // private readonly userService: UserService,
  ) {}

  async generateTwoFactorAuthenticationSecret(user: any) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.username,
      this.config.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      secret,
    );
    // await this.userService.setTwoFactorAuthenticationSecret(secret, user.userId);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorAuthSecret: secret,
      },
    });
    return otpauthUrl;
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isTwoFactorAuthEnabled: true,
      },
    });
  }

  // createCookie
  async createCookie(request: RequestWithUser, tfa = false) {
    const accessTokenCookie = this.generateToken(request.user, tfa);
    // request.res.setHeader('Set-Cookie', [accessTokenCookie]);
    request.res.cookie('jwt', accessTokenCookie, {
      httpOnly: true,
      secure: true,
    });
    return request.res;
  }

  async turnOffTwoFactorAuthentication(userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isTwoFactorAuthEnabled: false,
      },
    });
  }

  async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: UserTfaDto,
  ) {
    return await authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthSecret,
    });
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  async verifyToken(token: string) {
    const payload: any = await this.jwtService.verify(token, {
      secret: this.config.get('JWT_SECRET'),
    });
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
        email: payload.email,
      },
    });
    if (user) {
      delete user.token;
      delete user.password;
      delete user.email;
    }
    return user;
  }
  
  downloadimg(url: string, id: number)
  {
    fetch(url)
    .then((response) => response.buffer())
    .then((buffer) => {
      fs.writeFile(path.join("/app/src/img/", id + ".png"), buffer)}
    );
  }
  async Signup(req) {
    try {
      const userInput : Prisma.UserCreateInput = {
          email: req.user.email,
          token: req.user.accessToken,
          photo: req.user.picture,
          firstname: req.user.firstName,
          lastname: req.user.lastName,
          username: req.user.email.split('@')[0],
          bio: "Hello there, I am Playing Pong",
          instagram: "https://www.instagram.com/",
          linkedin: "https://www.linkedin.com/",
          github: "https://github.com/",
      };
      const user = await this.prisma.user.create({
        data: userInput,
      });
      this.downloadimg(user.photo, user.id);
      await this.prisma.user.update({
        where:{
          id: user.id,
        },
        data:{
          photo: "/images/" + user.id + ".png",
        }
      })
      return user;
    } catch (error) {
      throw new Error('error occured while creating user');
    }
  }
  async SignIn(req) {
    let user = await this.prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
    });
    if (!user) {
      user = await this.Signup(req);
    }
    return {
      msg: 'user already exist',
      user,
      token: this.generateToken(user),
    };
  }

  // async generateToken(user: any) {
  //   const payload = { sub: user.id, email: user.email };
  //   return this.jwtService.sign(payload, {
  //     expiresIn: '1d',
  //     secret: this.config.get('JWT_SECRET'),
  //   });
  // }
  public generateToken(user: any, isTwoFactorAuthEnabled = false) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      isTwoFactorAuthEnabled,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: `${this.config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`,
    });
    // if (!isTwoFactorAuthEnabled) {
    return token;
    // }
    // return `jwt=${token}; HttpOnly; Path=/; Max-Age=${this.config.get(
    //   'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    // )}`;
    // await res.cookie('jwt', token, {
    //   domain: 'localhost', // Set to your domain
    //   path: '/',
    //   httpOnly: true,
    //   secure: true, // Set to true for HTTPS
    //   //sameSite: 'Lax', // Adjust based on your requirements
  // });
  }
}

// @Injectable()
// export class AuthService {
//     constructor(private prisma: PrismaService) { }

//     async signUp(dto: AuthDto) {

//         //const hash = await argon.hash(dto.password);

//         const user = await this.prisma.user.create({
//             data: {
//                 email: dto.email,
//                 //password: hash,
//             }
//         });
//         delete user.password;
//         return user;
//     }

//     async signIn(dto: AuthDto) {
//        // const hash = await argon.hash(dto.password);
//         const user = await this.prisma.user.findUnique({
//             where: {
//                 email: dto.email
//             }
//         });
//         if (!user) {
//             throw new ForbiddenException("Invalid email");
//         }
//         // const isPasswordValid = await argon.verify(hash ,dto.password);
//         // if (!isPasswordValid) {
//         //     throw new ForbiddenException("Invalid password");
//         // }
//         delete user.password;
//         return user;
//     }
// }
