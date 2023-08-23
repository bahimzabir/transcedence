import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { HomeModule } from './home/home.module';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { GameController } from './game/game.controller';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    HomeModule,
    // EventsModule,
    ChatModule,
    GameModule,
  ],
  //controllers: [GameController],
})
export class AppModule {}
