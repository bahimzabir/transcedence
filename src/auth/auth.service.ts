import { Injectable, Body } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from 'src/dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async Signup(req) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: req.user.email,
          token: req.user.accessToken,
          photo: req.user.picture,
          firstname: req.user.firstName,
          lastname: req.user.lastName,
        },
      });
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
      token: await this.generateToken(user),
    };
  }

  async generateToken(user: any) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });
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
