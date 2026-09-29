import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  listConversations,
  searchUsers,
  getMessages,
  deleteMessage,
  clearConversation,
} from '../controllers/messages.controller.js';

const router = Router();

// all routes require auth
router.use(authenticate);

/* ── static routes FIRST (before /:userId) ── */
router.get('/conversations', listConversations);
router.get('/users/search',  searchUsers);

/* ── delete routes ── */
router.delete('/message/:id', deleteMessage);   // 2-segment, no conflict
router.delete('/:userId',      clearConversation);

/* ── dynamic LAST ── */
router.get('/:userId', getMessages);

export default router;