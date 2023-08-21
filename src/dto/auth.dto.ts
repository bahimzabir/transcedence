import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  password: string;
}

export class ChatRoomBody {
    //@IsNumber()
    name?: string;
}
 