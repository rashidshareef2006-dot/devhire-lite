import { Router } from 'express';
import { getAbout } from '../controllers/about.controller.js';

const router = Router();

router.get('/', getAbout);

export default router;