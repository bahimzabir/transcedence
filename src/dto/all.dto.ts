import { IS_NOT_EMPTY, IsAlphanumeric, IsArray,IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, isArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { isInt16Array, isInt32Array } from 'util/types';

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    password: string;
}



export class GameRecords {
    @IsAlphanumeric()
    @ApiProperty()
    player1Id: number;
    @IsAlphanumeric()
    @ApiProperty()
    player2Id: number;
    @IsAlphanumeric()
    @ApiProperty()
    player1Score: number;
    @IsAlphanumeric()
    @ApiProperty()
    player2Score: number;
    @IsString()
    @ApiProperty()
    type: string;
}

class chatroomUserDto {
    id: number;
    name: string;
    avatar: string;
    isdm: boolean;
    receiver: number;
}


export class UserUpdateDto {
    @IsString()
    @IsOptional()
    @ApiProperty()
    bio?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    photo?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    username?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    firstname?: string;
    @IsString()
    @IsOptional()
    @ApiProperty()
    lastname?: string;
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
