import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import adminRoutes from './routes/admin.routes.js';
import applicationsRoutes from './routes/applications.routes.js';
import aboutRoutes from './routes/about.routes.js';
import usersRoutes from './routes/users.routes.js';
import { disconnectPrisma } from './lib/prisma.js';
import { initSocket } from './lib/socket.js';

const app = express();

// ─── CORS: multiple origins support (comma-separated in CLIENT_URL) ───
const allowedOrigins = (env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// ⚠️ IMPORTANT: origin must be a FUNCTION, not a string
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        // ✅ Return the SPECIFIC origin (single value) — NOT `true`
        return callback(null, origin);
      }

      // ❌ Not allowed
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));

// Static uploads
app.use('/uploads', express.static(path.resolve('uploads')));

// Rate limiting
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Too many requests', code: 'RATE_LIMITED' } },
  }),
);

// Health
app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Root info
app.get('/', (_req, res) => {
  res.json({
    name: 'DevHire Lite API',
    version: '0.1.0',
    status: 'running',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/about', aboutRoutes);

// 404 + errors
app.use(notFoundHandler);
app.use(errorHandler);

// HTTP server + Socket.IO
const server = http.createServer(app);

initSocket(server, allowedOrigins);

server.listen(env.PORT, () => {
  console.log(`🚀 DevHire API running on http://localhost:${env.PORT}`);
  console.log(`   ENV: ${env.NODE_ENV}`);
  console.log(`   🌐 CORS allowed origins: ${allowedOrigins.join(', ') || '(none)'}`);
  console.log(`   🔌 Socket.IO ready`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));