import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';
import {
  getProfile,
  updateProfile,
  uploadAvatarHandler,
} from '../controllers/users.controller.js';

const router = Router();

// All user routes require auth
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', uploadAvatar, uploadAvatarHandler);

export default router;