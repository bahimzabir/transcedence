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