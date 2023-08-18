import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  private config : ConfigService;
  getUserJwt(socket: Socket) {
    let token = socket.handshake.headers.cookie;
    token = token.split(' ')[1];
    const Decoded = jwt.verify(token, 'very-very-secret-hahaha');
    return Decoded;
  }

  getIdFromJwt(userNotDecoded: any) {
    const user = JSON.parse(JSON.stringify(userNotDecoded));
    return user.sub;
  }
  async create(createMessageDto: CreateChatDto, sender: number) {
    
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
