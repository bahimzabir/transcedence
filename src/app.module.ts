import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { HomeModule } from './home/home.module';
import { ChatModule } from './chat/chat.module';
import { EventsGateway } from './events/events.gateway';
import { GameController } from './game/game.controller';
import { GameModule } from './game/game.module';
import { MulterModule } from '@nestjs/platform-express';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    HomeModule,
    ChatModule,
    GameModule,
    EventsGateway
  ],
  //controllers: [GameController],
})
export class AppModule {}
