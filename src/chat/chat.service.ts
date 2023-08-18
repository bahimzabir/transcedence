import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ChatRoomBody } from 'src/dto';
import { connect } from 'http2';

@Injectable()
export class ChatService {
    
}
