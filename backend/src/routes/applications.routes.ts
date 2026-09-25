import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  myApplications,
  receivedApplications,
  myPostedJobs,
} from '../controllers/applications.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', myApplications);
router.get('/received', receivedApplications);
router.get('/my-jobs', myPostedJobs);

export default router;