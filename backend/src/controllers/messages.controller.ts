import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { getIO } from '../config/socket.js';

/* ───────────────────────── helpers ───────────────────────── */
const getAuthUserId = (req: Request): string => {
  const u = (req as any).user ?? {};
  const id = u.id ?? u.sub ?? u.userId ?? (req as any).userId;
  if (!id) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
  return id;
};

/* ───────────────────── list conversations ────────────────── */
export const listConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender:   { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    const map = new Map<string, any>();
    for (const m of messages) {
      const other = m.senderId === userId ? m.receiver : m.sender;
      if (!map.has(other.id)) {
        map.set(other.id, {
          user: other,
          lastMessage: m.content,
          lastAt: m.createdAt,
          unreadCount: !m.read && m.receiverId === userId ? 1 : 0,
          online: false, // TODO: socket presence se fill karo baad me
        });
      } else if (!m.read && m.receiverId === userId) {
        map.get(other.id).unreadCount += 1;
      }
    }

    // ✅ Service expect karti hai: { success, data: [...] }
    res.json({ success: true, data: Array.from(map.values()) });
  } catch (err) { next(err); }
};

/* ───────────────────────── search users ──────────────────── */
export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);
    const q = String(req.query.q ?? '').trim();
    if (!q) return res.json({ success: true, data: [] });

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              { name:  { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: { id: true, name: true, email: true, avatar: true, role: true },
      take: 10,
    });

    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

/* ─────────────────────── get messages ────────────────────── */
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);
    const otherUserId = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId,      receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: userId, read: false },
      data:  { read: true },
    });

    // ✅ Service expect karti hai: { success, data: [...] }
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};

/* ────────────────────── DELETE single message ────────────── */
export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);
    const { id } = req.params;

    const msg = await prisma.message.findUnique({ where: { id } });
    if (!msg) throw new AppError(404, 'NOT_FOUND', 'Message not found');
    if (msg.senderId !== userId) throw new AppError(403, 'FORBIDDEN', 'Not your message');

    await prisma.message.delete({ where: { id } });

    // socket emit NEVER fails the HTTP request
    try {
      const io = getIO();
      const payload = { id, conversationWith: msg.receiverId };
      io?.to(msg.receiverId).emit('message_deleted', payload);
      io?.to(userId).emit('message_deleted', payload);
    } catch (e) {
      console.warn('[socket] message_deleted emit failed:', e);
    }

    // delete response me service `r.data` directly padhti hai — { success, data } dono theek
    res.json({ success: true, data: { id } });
  } catch (err) { next(err); }
};

/* ────────────────────── CLEAR conversation ───────────────── */
export const clearConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);
    const otherUserId = req.params.userId;

    const result = await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId,      receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });

    try {
      const io = getIO();
      const payload = { by: userId, userId };
      io?.to(otherUserId).emit('conversation_cleared', payload);
      io?.to(userId).emit('conversation_cleared', payload);
    } catch (e) {
      console.warn('[socket] conversation_cleared emit failed:', e);
    }

    res.json({ success: true, data: { deleted: result.count } });
  } catch (err) { next(err); }
};