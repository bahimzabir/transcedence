import { Injectable, Body } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from 'src/dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import * as path from 'path'
import respone from 'express'
import { buffer } from 'stream/consumers';
@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}


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
    const filepath = path.join(__dirname, '../../src/chat/img/');
    fetch(url)
    .then((response) => response.buffer())
    .then((buffer) => {
      fs.writeFile(path.join(filepath, id + ".png"), buffer)}
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
          photo: "http://localhost:3000/" + user.id + ".png",
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
