import { Controller, Get, Req, Post, UseGuards, Body } from '@nestjs/common';
import { JwtGard } from 'src/auth/guard';
import { ChatService } from './chat.service';
import { get } from 'http';
import { ChatRoomBody } from 'src/dto/auth.dto';


@UseGuards(JwtGard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {
    }
    @Post('new')
    createChatRoom(@Req() req: any, @Body() body: any) {
        return this.chatService.createChatRoom(req, body);
    }
}
