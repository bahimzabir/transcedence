import { IS_NOT_EMPTY, IsAlphanumeric, IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  password: string;
}

export class ChatRoomBody {
    @IsString()
    @IsNotEmpty()
    name?: string;
    isPrivate?: boolean;
    isDm?: boolean;
    @IsNumber()
    @IsNotEmpty()
    password?: string;
}

export class GameRecords {
  @IsAlphanumeric()
  goalsscored  ;
  @IsAlphanumeric()
  goalsconceded;
  @IsAlphanumeric()
  win ;
  @IsAlphanumeric()
  lose  ;
  @IsAlphanumeric()
  draw  ;
}