import { Router } from 'express';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getPublicStats,
} from '../controllers/jobs.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { uploadJobImage } from '../middleware/upload.middleware.js';

const router = Router();

/* ── public ── */
router.get('/stats', getPublicStats);
router.get('/', listJobs);
router.get('/:id', getJob);

/* ── recruiter/admin (with image upload) ── */
router.post(
  '/',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  uploadJobImage,   // ⬅️ multer runs AFTER auth so req.user is set
  createJob,
);
router.put(
  '/:id',
  authenticate,
  requireRole('RECRUITER', 'ADMIN'),
  uploadJobImage,
  updateJob,
);
router.delete('/:id', authenticate, requireRole('RECRUITER', 'ADMIN'), deleteJob);

/* ── candidate ── */
router.post('/:id/apply', authenticate, requireRole('CANDIDATE'), applyToJob);

export default router;