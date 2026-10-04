import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from './error.middleware.js';

// ── Avatars dir ──
const AVATAR_DIR = path.resolve('uploads/avatars');
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });

// ── Job images dir ──
const JOB_DIR = path.resolve('uploads/jobs');
if (!fs.existsSync(JOB_DIR)) fs.mkdirSync(JOB_DIR, { recursive: true });

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/* ══════════════════════════════════════════════
   AVATAR UPLOAD
══════════════════════════════════════════════ */
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const userId = (req as any).user?.sub ?? (req as any).user?.id ?? 'anon';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPG, PNG, or WEBP allowed'));
    }
    cb(null, true);
  },
}).single('avatar');

/* ══════════════════════════════════════════════
   JOB IMAGE UPLOAD
══════════════════════════════════════════════ */
const jobStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, JOB_DIR),
  filename: (req, file, cb) => {
    const userId = (req as any).user?.sub ?? (req as any).user?.id ?? 'anon';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `job-${userId}-${Date.now()}${ext}`);
  },
});

export const uploadJobImage = multer({
  storage: jobStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB hard cap (client compresses to ~100KB)
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPG, PNG, or WEBP allowed'));
    }
    cb(null, true);
  },
}).single('image');