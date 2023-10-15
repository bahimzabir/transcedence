import {Logger, Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { JwtGard } from 'src/auth/guard';
@UseGuards(JwtGard)
@Controller('images')
export class ImagesController {
  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    
    try {
      if(fs.existsSync(`/app/src/img/${filename}`))
      {
        const fileStream = fs.createReadStream(`/app/src/img/${filename}`);
        fileStream.pipe(res);
      }
      else{
        Logger.error(`File Does not exist ${filename}`)        
      }
    }
    catch(error)
    {
      console.log("------------>", error)
    }
  }
}