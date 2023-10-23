import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { StreamGateway } from './stream.gateway';
import { BotGateway } from './bot.gateway';
import { EventsGateway } from 'src/events/events.gateway';
import { SpeedGateway } from './speed.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  providers: [GameService, GameGateway, StreamGateway, BotGateway, EventsGateway, SpeedGateway],
  controllers: [GameController]
})
export class GameModule {}
