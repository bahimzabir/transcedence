import {
  Controller,
  Get,
  Req,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { ChatService } from './chat.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import JwtTwoFactorGuard from 'src/auth/guard/jwt-two-factor.guard';
import { ChatRoomBody, newchatdto } from './entities/chat.entity';
import { classToPlain, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { STATUS_CODES } from 'http';

@UseGuards(JwtTwoFactorGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post('new')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/app/src/img',
        filename: (req, file, callback) => {
          const newFilename = `${uuidv4()}${path.extname(file.originalname)}`;
          callback(null, newFilename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(new HttpException('Only image files are allowed!', HttpStatus.CONFLICT), false);
        }
        callback(null, true);
      },
    }),
  )  
  async createChatRoom(
    @Req() req: any,
    @Body('body') body,
    @UploadedFile() file: Express.Multer.File,
) {
  try{

    const chatroombody: newchatdto = JSON.parse(body);
    const valid = await validate(plainToClass(newchatdto, chatroombody));
    if(valid.length > 0)
      throw new HttpException("PASSWORD AND NAME SHOULD NOT BE EMPTY", HttpStatus.CONFLICT);
    const creatroom = await this.chatService.createChatRoom(req, chatroombody);
    const filename = +creatroom.id + 'room.png';
    await fs.rename(file.path, path.join('/app/src/img/', filename), () => {});
  }
  catch(error) {
    throw error;
  }
  }
  @Post('newdm')
  async creatDmroom(@Req() req: any, @Body() body) {
    const creatdm = await this.chatService.createdm(req, body);
  }
  @Get('all')
  getAllChatRooms(@Req() req: Request) {
    return this.chatService.findAll();
  }

  @Get('roominfos')
  getRoominfos(@Query('id') id: number) {
    return this.chatService.roomInfos(id);
  }
  @Post('joinroom')
  joinRoom(@Req() req, @Body() body: any) {
    return this.chatService.joinroom(+req.user.id, body);
  }
  @Post("joinByinvt")
  async joinroombyinvetation(@Req() req, @Body("roomid") body)
  {
      await this.chatService.forcejoining(req.user.id, body);
  }
  @Get('getroomsmsg')
  getroomMsg(@Req() req, @Query('id') roomid: number) {
    return this.chatService.getroommsg(req.user.id, roomid);
  }
  @Get('roomMemebers')
  getroomembers(@Req() req, @Query('id') id: number) {
    return this.chatService.getroomembers(req.user.id, +id);
  }
  @Get('getallrooms')
  getallchatrooms() {
    return this.chatService.getallrooms();
  }
  @Get('getdminfos')
  getdmroominfos(@Req() req, @Query('id') roomid: number) {
    return this.chatService.getdmroominfos(roomid, +req.user.id);
  }
  @Post("remove")
  async removechatroom(@Req() req, @Body("roomid") roomid: number){
    return await this.chatService.removechat(req.user.id, roomid)
  }
  @Post("Leave")
  leavechatroom(@Req() req, @Body("roomid") roomid: number)
  {
    return this.chatService.leaveroom(req.user.id, roomid)
  }
}
