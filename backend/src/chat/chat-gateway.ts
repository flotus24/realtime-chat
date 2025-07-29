import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [process.env.DOMAIN],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 5 * 60 * 1000, // 5 minutes
    skipMiddlewares: true, // Skip middlewares upon successful recovery
  },
})
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.use((socket, next) => {
      const userID = socket.handshake.auth.userID;
      socket.data.userID = userID; // Attach user ID to the socket
      next();
    });

    this.server.on('connection', (socket) => {
      const username = socket.handshake.auth.username;
      socket.data.username = username;
      // Join user to their specific room(s)
      socket.join(`user_${socket.data.userID}`);
      // Check if the connection state was recovered
      if (socket.recovered) {
        console.log(
          `Socket state recovered for user ${socket.data.userID}, ID: ${socket.id}. Rooms: ${Array.from(socket.rooms).join(', ')}`,
        );
        // If state was recovered, the socket.data.userId would also be restored if it was set previously.
      } else {
        console.log(
          `New session or unrecoverable session for user ${socket.data.username} with userID: ${socket.data.userID} and socketID: ${socket.id}`,
        );
        // console.log(socket.rooms.has(`user_${socket.data.userID}`));
      }
      socket.broadcast.emit('userUpdated');

      socket.on('getUsers', () => {
        const users: any[] = [];
        for (let [id, socket] of this.server.of('/').sockets) {
          users.push({
            userID: socket.data.userID,
            username: socket.data.username,
          });
        }
        socket.emit('resUsers', users);
      });

      socket.on('newMessage', (message, selected) => {
        socket
          .to(`user_${selected.fromUserID}`)
          .emit('onMessage', message, socket.data.userID);
      });

      socket.on('disconnect', () => {
        socket.broadcast.emit('userUpdated');
      });
    });
  }

  // @SubscribeMessage('newMessage')
  // handleNewMessage(@MessageBody() message: any) {
  //   this.server.emit('onMessage', {
  //     msg: 'New Message',
  //     content: message,
  //     fromSelf: true,
  //   });
  // }
}
