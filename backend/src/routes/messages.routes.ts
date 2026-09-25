import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  listConversations,
  searchUsers,
  getMessages,
} from '../controllers/messages.controller.js';

const router = Router();

router.use(authenticate);

router.get('/conversations', listConversations);
router.get('/users/search', searchUsers);
router.get('/:userId', getMessages);

export default router;