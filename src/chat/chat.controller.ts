import { Controller, Get, Req, Post, UseGuards, Body, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { ChatService } from './chat.service';
import { get } from 'http';
import { ChatRoomBody } from 'src/dto/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@UseGuards(JwtGard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {
    }
    @Post('new')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './src/chat/img',
        }),
    })
    )
    async createChatRoom(@Req() req: any, @Body() body,
    @UploadedFile() file: Express.Multer.File) {
        const creatroom = await this.chatService.createChatRoom(req, body);
        const filename = +creatroom.id + "room.png";
        await fs.rename(file.path, path.join("src/chat/img/", filename), () =>{})
        return creatroom;
    }


    @Get('all')
    getAllChatRooms(@Req() req: Request) {
        return this.chatService.findAll();
    }

    @Get('roominfos:id')
    async getRoominfos(@Req() req, id: number)
    {
        console.log("HOOO")
        return this.chatService.roomInfos(id);
    }
}
