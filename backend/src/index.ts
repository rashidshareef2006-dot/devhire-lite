import express from 'express';
import http from 'http';
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
import { disconnectPrisma } from './lib/prisma.js';
import { initSocket } from './lib/socket.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

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
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      jobs: {
        list: 'GET /api/jobs',
        create: 'POST /api/jobs',
        detail: 'GET /api/jobs/:id',
        apply: 'POST /api/jobs/:id/apply',
      },
      messages: {
        conversations: 'GET /api/messages/conversations',
        history: 'GET /api/messages/:userId',
        searchUsers: 'GET /api/messages/users/search?q=',
      },
      applications: {
        mine: 'GET /api/applications/me',
        received: 'GET /api/applications/received',
        myJobs: 'GET /api/applications/my-jobs',
      },
      admin: {
        login: 'POST /api/admin/login',
        stats: 'GET /api/admin/stats',
        users: 'GET /api/admin/users',
      },
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/admin', adminRoutes);

// 404 + errors
app.use(notFoundHandler);
app.use(errorHandler);

// HTTP server + Socket.IO
const server = http.createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`🚀 DevHire API running on http://localhost:${env.PORT}`);
  console.log(`   ENV: ${env.NODE_ENV}`);
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