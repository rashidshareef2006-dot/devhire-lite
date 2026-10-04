import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from './error.middleware.js';

const UPLOAD_DIR = path.resolve('uploads/avatars');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const userId = (req as any).user?.id ?? (req as any).user?.sub ?? 'anon';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPG, PNG, or WEBP allowed'));
    }
    cb(null, true);
  },
}).single('avatar');