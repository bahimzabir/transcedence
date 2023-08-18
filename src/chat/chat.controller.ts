import { Controller, Get, Req, Post, UseGuards, Body } from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { ChatService } from './chat.service';
import { get } from 'http';


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
}
