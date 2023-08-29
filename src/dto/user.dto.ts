import { IsAlphanumeric, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}