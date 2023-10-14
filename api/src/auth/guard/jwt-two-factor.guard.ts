// import { AuthGuard } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import {
//   Injectable,
//   UnauthorizedException,
//   ExecutionContext,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';
// import TokenPayload from '../interfaces/tokenPayload.interface';
// import { PrismaService } from 'src/prisma/prisma.service';
// @Injectable()
// export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {
//   handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
//     if (err || !user) {
//       console.log(err);
//       console.log(user);
//       throw new UnauthorizedException();
//     }
//     return super.handleRequest(err, user, info, context);
//   }
// }
// // export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {
// //   constructor() {
// //     super();
// //   }
// // }

// @Injectable()
// export class JwtTwoFactorStrategy extends PassportStrategy(
//   Strategy,
//   'jwt-two-factor',
// ) {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly prisma: PrismaService,
// ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (request: Request) => {
//           return request?.cookies?.jwt;
//         },
//       ]),
//       secretOrKey: configService.get('JWT_SECRET'),
//     });
//   }
 
//   async validate(payload: TokenPayload) {
//     const user = await this.prisma.user.findUnique({
//       where: {
//         id: payload.id,
//       },
//     });
//     if (!user.isTowFactorAuthEnabled) {
//       return user;
//     }
//     if (payload.isTowFactorAuthEnabled) {
//       return user;
//     }
//   }
// }cd api

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {}
