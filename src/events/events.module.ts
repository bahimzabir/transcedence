import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [EventsGateway, ChatModule],
})
export class EventsModule {}
