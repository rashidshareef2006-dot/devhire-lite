import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { updateAbout } from '../controllers/about.controller.js';
import {
  adminLogin,
  getAdminStats,
  getAllUsers,
  getAllJobs,
  getAllApplications,
  deleteUser,
  deleteJobAdmin,
  deleteApplication,
} from '../controllers/admin.controller.js';
import { authenticateAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// Strict rate limit on admin login (brute-force protection)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many login attempts. Try again in 15 minutes.', code: 'RATE_LIMITED' },
  },
});

// Public admin login
router.post('/login', adminLoginLimiter, adminLogin);

// Protected admin routes
router.use(authenticateAdmin);
router.put('/about', updateAbout);
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/jobs', getAllJobs);
router.get('/applications', getAllApplications);

router.delete('/users/:id', deleteUser);
router.delete('/jobs/:id', deleteJobAdmin);
router.delete('/applications/:id', deleteApplication);

export default router;