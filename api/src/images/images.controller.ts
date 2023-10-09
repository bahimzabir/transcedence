import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { JwtGard } from 'src/auth/guard';
@UseGuards(JwtGard)
@Controller('images')
export class ImagesController {

  @Get()
  sayHI(){
    console.log("HII")
  }
  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const fileStream = fs.createReadStream(`/app/src/img/${filename}`);
    fileStream.pipe(res);
  }
}