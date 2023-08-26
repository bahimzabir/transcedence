import { Injectable, Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatModule } from 'src/chat/chat.module';
import { WsGuard } from 'src/auth/guard';

@Module({
  // imports: [WsGuard],
  providers: [EventsGateway, ChatModule],
})
export class EventsModule {}
