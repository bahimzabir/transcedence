import { Controller, Get, Req, Post, UseGuards, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { GameRecords } from 'src/dto';
import { JwtGard } from 'src/auth/guard';
import { game } from '@prisma/client';
import JwtTwoFactorGuard from 'src/auth/guard/jwt-two-factor.guard';

@UseGuards(JwtTwoFactorGuard)
@Controller('game')
export class GameController {
    constructor(private readonly gameservice: GameService) {}
}
