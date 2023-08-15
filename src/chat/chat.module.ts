import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { EventsModule } from 'src/events/events.module';

@Module({
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
