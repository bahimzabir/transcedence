import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { HomeModule } from './home/home.module';
import { ChatModule } from './chat/chat.module';
import { EventsGateway } from './events/events.gateway';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    HomeModule,
    ChatModule,
  ],
})
export class AppModule {}
