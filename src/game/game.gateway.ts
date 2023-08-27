import { Interval } from '@nestjs/schedule';
import { 
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  MessageBody
} from '@nestjs/websockets';

import * as jwt from "jsonwebtoken"
import { connected } from 'process';

import { Server, Socket } from "socket.io"
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';


interface BallPos {
  x?: number;
  y?: number;
}

interface GameData {
  ballPos: BallPos;
  leftPlayerY: number;
  rightPlayerY: number;
  speedX: number;
  speedY: number;
}

interface User {
  id: String;
  userSocket: Socket;
}

interface Room {
  players?: Socket[];
  roomName?: string;
  data?: GameData;
}

const socketConfig = {
  cors: {
    origin: [ 'http://localhost:5173', 'http://10.14.8.7:5173', 'http://10.14.8.7:3000'],
    credentials: true,
  },
  namespace: 'game'
};


@WebSocketGateway( socketConfig )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private gameService: GameService, private userService: UserService) {}

  @WebSocketServer()
  server: Server;

  private queue: Socket[] = [];
  private rooms: Room[] = [];
  private playerIds: number[] = [];

  private roomNames: String[] = [];

  async handleConnection(client: Socket) : Promise<void> {
    const cookie = client.handshake.headers.cookie;
    const jwtToken = cookie.split('=')[1];
    
    const jwtPayload : any = jwt.verify(jwtToken, 'very-very-secret-hahaha')
    const userId = jwtPayload.sub;

    // if (this.playerIds.includes(userId)) {
    //   console.log("already playing");
    //   return ;
    // }
    // else {
    //   console.log("Not in game");
    //   this.playerIds.push(userId);
    // }
    // console.log(jwtPayload);
    const user = await this.userService.getUserById(userId);
    console.log(user.email);
    
    

    this.queue.push(client);

    if (this.queue.length >= 2) {
      console.log("ewa");
      const players = this.queue.splice(0, 2);
      const roomName: string = this.createNewRoom();

      let n = 0;
      players.forEach(player => {
        player.join(roomName);
        player.emit("join_room", {side: n, roomName: roomName});
        n++;
      });

      let room: Room = {roomName: roomName,
                        players: players,
                        data: {
                          ballPos: {x: 500, y:300},
                          speedX: 2,
                          speedY: 1,
                          leftPlayerY: 250,
                          rightPlayerY: 250
                        }};
      
      this.rooms.push(room);
      this.server.to(room.roomName).emit("started");
    }

  }



  private createNewRoom() : string {
    let roomName: string;
    
    do {
      roomName = Math.random().toString(36).substring(7);
    } while (this.roomNames.includes(roomName));
    
    this.roomNames.push(roomName);

    return roomName;

  }

  // handle disconnection of one of the players
  handleDisconnect(client: Socket) {}

  @Interval(10)
  async moveBall() {
    for (let room of this.rooms) {
      room.data.ballPos.x += room.data.speedX;
      room.data.ballPos.y += room.data.speedY;

      if (room.data.ballPos.y >= 595 || room.data.ballPos.y <= 5) {
        room.data.speedY *= -1;
      }
      if (room.data.ballPos.x > 1000 || room.data.ballPos.x < 0) {
        room.data.ballPos = {x: 500, y:300};
        room.data.speedX *= -1;
        room.data.speedY *= -1;
      }

      if (room.data.ballPos.x <= 10 && (room.data.ballPos.y > room.data.leftPlayerY && room.data.ballPos.y < room.data.leftPlayerY+80)) {
        room.data.speedX *= -1;
      }
      if (room.data.ballPos.x >= 990 && (room.data.ballPos.y > room.data.rightPlayerY && room.data.ballPos.y < room.data.rightPlayerY+80)) {
        room.data.speedX *= -1;
      }

      this.server.to(room.roomName).emit("update", room.data);
    }
  }

  @SubscribeMessage("move")
  async movePaddle(@MessageBody() data: any) {

    let room = this.getRoomByName(data.roomName);

    if (room === undefined) {
      return ;
    }

    if (data.Side === "left" ) {
      room.data.leftPlayerY += data.deltaY;
    }
    else if (data.Side === "right" ) {
      room.data.rightPlayerY += data.deltaY;
    }

    this.server.to(data.roomName).emit("update",  room.data);

  }


  private getRoomByName(roomName: string) : Room | undefined {
    for (let room of this.rooms) {
      if (room.roomName === roomName) {
        return room;
      }
    }
    return undefined;

  }  
}
