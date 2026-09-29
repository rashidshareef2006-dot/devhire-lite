import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const setIO = (server: Server) => {
  io = server;
};

/** Null-safe: emit se pehle `io?.` ya `if (io)` use karo */
export const getIO = (): Server | null => io;

export const initSocket = (httpServer: HttpServer) => {
  const ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  setIO(ioInstance);

  ioInstance.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string | undefined;
    if (userId) {
      socket.join(userId);
      console.log(`🔌 Socket joined room: ${userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};