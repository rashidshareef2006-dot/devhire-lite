import { Router } from 'express';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
} from '../controllers/jobs.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', listJobs);
router.get('/:id', getJob);

router.post('/', authenticate, requireRole('RECRUITER', 'ADMIN'), createJob);
router.put('/:id', authenticate, requireRole('RECRUITER', 'ADMIN'), updateJob);
router.delete('/:id', authenticate, requireRole('RECRUITER', 'ADMIN'), deleteJob);

router.post('/:id/apply', authenticate, requireRole('CANDIDATE'), applyToJob);

export default router;