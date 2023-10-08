import { Module } from '@nestjs/common';
import { ImgService } from './img.service';
import { ImgController } from './img.controller';

@Module({
  providers: [ImgService],
  controllers: [ImgController]
})
export class ImgModule {}
