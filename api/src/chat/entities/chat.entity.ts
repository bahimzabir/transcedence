import { IS_NOT_EMPTY, IsAlphanumeric, IsEmail, IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';

export class ChatRoomBody {
    id: number;
    message: string;    
    @IsString()
    @IsNotEmpty()
    name?: string;
    isPrivate?: boolean;
    isDm?: boolean;
    @ValidateIf((o) => o.status === 'protected')
    @IsNumber()
    @IsNotEmpty()
    password?: string;
    status?: string;
    receiver: number;
    sender: number;
}
export class newchatdto {
    @IsString()
    @IsNotEmpty()
    name: string;
    status: string;
    @ValidateIf((o) => o.status === 'protected')
    @IsNotEmpty()
    password: string;
}
