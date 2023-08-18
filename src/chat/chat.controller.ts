import { Controller, Get, Req, Post, UseGuards, Body } from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { ChatService } from './chat.service';
import { get } from 'http';
import { ChatRoomBody } from 'src/dto';


@UseGuards(JwtGard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}
    @Get('me')
    getChat(@Req() req: any) {
        // return ('chats');
        try {
            return this.chatService.getChats(req);
        } catch (error) {
            console.log("error");
        }
    }
    @Post('me')
    createChat(@Req() req: any, @Body() body: ChatRoomBody) {
        try {
            return this.chatService.createChat(req, body);
        } catch (error) {
            console.log("error");
        }
    }
}
