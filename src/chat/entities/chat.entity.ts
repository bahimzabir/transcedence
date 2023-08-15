export class Chat {
    id: number;
    receiverId?: number;
    name?: string;
    message?: string;
    time: Date = new Date();
    isDm?: boolean = false;
    isAdmin?: boolean = false;
    isPublic?: boolean = true;
    password?: string;
    RoomId?: number;
}