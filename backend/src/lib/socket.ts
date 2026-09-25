import type { Server as HTTPServer } from 'http';
import { Server, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from './prisma.js';

interface AuthSocket extends Socket {
  userId?: string;
}

let io: Server | null = null;

// userId -> Set of socket IDs (multiple tabs)
const onlineUsers = new Map<string, Set<string>>();

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  // JWT auth on connection
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);
    io!.emit('user_online', { userId });

    // Send message
    socket.on(
      'send_message',
      async (
        data: { receiverId: string; content: string },
        callback?: (res: { success: boolean; message?: unknown }) => void,
      ) => {
        try {
          const { receiverId, content } = data;
          if (!receiverId || !content?.trim()) return callback?.({ success: false });

          const message = await prisma.message.create({
            data: { senderId: userId, receiverId, content: content.trim() },
            include: {
              sender: { select: { id: true, name: true, email: true } },
              receiver: { select: { id: true, name: true, email: true } },
            },
          });

          io!.to(`user:${receiverId}`).emit('new_message', message);
          io!.to(`user:${userId}`).emit('new_message', message);
          callback?.({ success: true, message });
        } catch (err) {
          console.error('send_message error:', err);
          callback?.({ success: false });
        }
      },
    );

    // Typing indicator
    socket.on('typing', ({ receiverId, isTyping }: { receiverId: string; isTyping: boolean }) => {
      io!.to(`user:${receiverId}`).emit('user_typing', { userId, isTyping });
    });

    // Mark read
    socket.on('mark_read', async ({ senderId }: { senderId: string }) => {
      try {
        await prisma.message.updateMany({
          where: { senderId, receiverId: userId, read: false },
          data: { read: true },
        });
        io!.to(`user:${senderId}`).emit('messages_read', { by: userId });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('disconnect', () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io!.emit('user_offline', { userId });
        }
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}