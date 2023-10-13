import { ConsoleLogger, Module } from '@nestjs/common';
import { UserController, TestController } from './user.controller';
import { UserService } from './user.service';
import {EventsGateway} from '../events/events.gateway';
import { ChatService } from 'src/chat/chat.service';

@Module({
  controllers: [UserController, TestController],
  providers: [UserService, EventsGateway, ChatService, ConsoleLogger],
})
export class UserModule {}
