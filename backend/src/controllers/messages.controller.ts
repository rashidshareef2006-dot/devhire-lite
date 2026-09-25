import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { isUserOnline } from '../lib/socket.js';
import { AppError } from '../middleware/error.middleware.js';

// GET /api/messages/conversations
export async function listConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const convMap = new Map<
      string,
      {
        user: { id: string; name: string; email: string; role: string };
        lastMessage: string;
        lastMessageAt: Date;
        unreadCount: number;
      }
    >();

    for (const m of messages) {
      const other = m.senderId === userId ? m.receiver : m.sender;
      if (!convMap.has(other.id)) {
        convMap.set(other.id, {
          user: other,
          lastMessage: m.content,
          lastMessageAt: m.createdAt,
          unreadCount: 0,
        });
      }
      if (m.receiverId === userId && !m.read) {
        convMap.get(other.id)!.unreadCount++;
      }
    }

    const conversations = Array.from(convMap.values()).map((c) => ({
      ...c,
      online: isUserOnline(c.user.id),
    }));

    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
}

// GET /api/messages/users/search?q=...
export async function searchUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const q = (req.query.q as string) || '';

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        ...(q && {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        }),
      },
      take: 20,
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

// GET /api/messages/:userId
export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const otherId = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true } } },
    });

    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: userId, read: false },
      data: { read: true },
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
}