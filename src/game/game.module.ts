import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { UserService } from 'src/user/user.service';
import { UserController } from 'src/user/user.controller';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  providers: [GameService, GameGateway, UserService],
  controllers: [GameController, UserController]
})
export class GameModule {}
