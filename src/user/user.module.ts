import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {EventsGateway} from '../events/events.gateway';
import { PrismaTypes } from 'src/prisma/prisma.service';
import { ChatService } from 'src/chat/chat.service';

@Module({
  controllers: [UserController],
  providers: [UserService, EventsGateway, ChatService],
})
export class UserModule {}
