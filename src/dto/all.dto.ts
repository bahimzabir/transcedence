import { IS_NOT_EMPTY, IsAlphanumeric, IsArray,IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, isArray } from 'class-validator';


export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    password: string;
}



export class GameRecords {
    @IsAlphanumeric()
    goalsscored;
    @IsAlphanumeric()
    goalsconceded;
    @IsAlphanumeric()
    win;
    @IsAlphanumeric()
    lose;
    @IsAlphanumeric()
    draw;
}

class chatroomUserDto {
    id: number;
    name: string;
    avatar: string;
    isdm: boolean;
    receiver: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { isInt16Array, isInt32Array } from 'util/types';

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
