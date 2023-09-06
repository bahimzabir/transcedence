import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}


@Injectable()
export class PrismaTypes {
  static roomUserSelect : Prisma.RoomUserSelect = {
    room: {
      select: {
        id: true,
        name: true,
        photo: true,
      }
    }
  }
}