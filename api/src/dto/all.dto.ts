import { IS_NOT_EMPTY, IsAlphanumeric, IsArray,IsBoolean, IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, isArray, IsUrl, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { isInt16Array, isInt32Array } from 'util/types';

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    password: string;
}


export class TwoFactorAuthenticationCodeDto {
  @IsNotEmpty()
  twoFactorAuthenticationCode: string;
}
export class UserTfaDto {
    @ApiProperty()
    username: string;
    @ApiProperty()
    id: number;
    @ApiProperty()
    twoFactorAuthSecret: string;
    @ApiProperty()
    email: string;
}

export class NotificationDto{
    userId: number;
    from: number;
    photo: string;
    type: string;
    message: string;
    read: boolean;
    roomid?: number;
}

export class messageDto {
    id: number;
    message: string;
    sender: number;
    roomid: number;
}

export class GameRecords {
    @IsNumber()
    @ApiProperty()
    player1Id: number;
    @IsNumber()
    @ApiProperty()
    player2Id: number;
    @IsNumber()
    @ApiProperty()
    player1Score: number;
    @IsNumber()
    @ApiProperty()
    player2Score: number;
    @IsString()
    @ApiProperty()
    type: string;
    @IsNumber()
    @ApiProperty()
    winnerId: number;
    @IsNumber()
    @ApiProperty()
    loserId: number;
}



export class UserUpdateDto {
    @IsString()
    @IsOptional()
    @ApiProperty()
    bio?: string;
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    @ApiProperty()
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username must only contain letters, numbers, or underscores',
    })
    username?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    firstname?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    lastname?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    fullname?: string;
    @IsUrl()
    @IsOptional()
    @ApiProperty()
    github?: string;
    @IsUrl()
    @IsOptional()
    @ApiProperty()
    linkedin?: string;
    @IsUrl()
    @IsOptional()
    @ApiProperty()
    instagram?: string;

}


export class FriendRequestDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    receiver: number;
}

export class FillRequestDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    id: number;
    // accept or reject
    @IsBoolean()
    @ApiProperty()
    response: boolean;
}


export class UpdateNotificationsDto {
    @IsArray()
    @ApiProperty()
    id: number[];
}

export class userevents{
    id: number;
    roomid: number;
}

export class  joinroomdto{
    @IsNumber()
    @ApiProperty()
    id: number;
    @ApiProperty()
    status: string;
    @ApiProperty()
    password?: string;
}
export class chatroomRequest {
    roomid: number;
    userid: number;
}

export class LinkDto {
    @IsUrl()
    @ApiProperty()
    link: string;
}

export enum systemclass{
    OWNER = 3,    
    ADMIN = 2,
    NORMAL = 1,
}
