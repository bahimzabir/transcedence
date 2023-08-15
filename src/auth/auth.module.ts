import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FortyTwoStrategy } from './42_.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStartegy } from './startegy';
import { GoogleOAuthGuard } from './guard/google-oauth.guard';
import { GoogleStrategy } from './google/google.strategy';
@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController, GoogleOAuthGuard],
  providers: [AuthService, FortyTwoStrategy, JwtStartegy, GoogleStrategy],
})
export class AuthModule {}
