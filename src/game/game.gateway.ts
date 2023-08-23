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
    origin: [ 'http://localhost:5173', 'http://10.14.8.6:5173', 'http://10.14.8.6:3000'],
    credentials: true,
  },
  namespace: 'game'
};


@WebSocketGateway( socketConfig )
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private queue: Socket[] = [];
  private rooms: Room[] = [];

  private roomNames: String[] = [];

  async handleConnection(client: Socket) : Promise<void> {
    // console.log("GOT hERE");
    const token = client.handshake.headers.cookie;
    
    // console.log(token);

    await this.queue.push(client);
    //client.emit("joined_queue");

    console.log(this.queue.length);
    if (this.queue.length >= 2) {
      const players = this.queue.splice(0, 2);
      const roomName: string = this.createNewRoom();
      let n = 0;
      players.forEach(player => {
        player.join(roomName);
        player.emit("join_room", {side: n, roomName: roomName});
        n++;
      });
      console.log('room created: ', roomName);

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
      console.log("emit match started");
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
  handleDisconnect(client: Socket) {
    
  }

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
    // console.log("moooove");
    // console.log(data)
    let room = this.getRoomByName(data.roomName);

    if (room === undefined) {
      return ;
    }

    // if (data.direction === "down" && data.Side === "left" && room.data.leftPlayerY < 520) {
    //   room.data.leftPlayerY += 5;
    // }
    // else if (data.direction === "down" && data.Side === "right" && room.data.rightPlayerY < 520) {
    //   room.data.rightPlayerY += 5;
    // }
    // else if (data.direction === "up" && data.Side === "left" && room.data.leftPlayerY > 0) {
    //   room.data.leftPlayerY -= 5;
    // }
    // else if (data.direction === "up" && data.Side === "right" && room.data.rightPlayerY > 0) {
    //   room.data.rightPlayerY -= 5;
    // }
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
