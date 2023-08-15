import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FortyTwoStrategy } from './42_.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStartegy } from './startegy';
@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, JwtStartegy],
})
export class AuthModule {}
