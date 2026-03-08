/**
 * EngiSuite Analytics - Node.js Backend Server
 * Converted from Python FastAPI to Express.js
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import calculatorRoutes from './routes/calculator.routes.js';
import workflowRoutes from './routes/workflow.routes.js';
import equationRoutes from './routes/equation.routes.js';
import pipelineRoutes from './routes/pipeline.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import vdaRoutes from './routes/vda.routes.js';
import learningRoutes from './routes/learning.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import aiRoutes from './routes/ai.routes.js';
import projectRoutes from './routes/project.routes.js';
import postRoutes from './routes/post.routes.js';
import priceRoutes from './routes/price.routes.js';
import canvasRoutes from './routes/canvas.routes.js';
import hostingerRoutes from './routes/hostinger.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reportRoutes from './routes/report.routes.js';
import localPipelinesRoutes from './routes/localPipelines.routes.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { rateLimiter } from './middleware/rateLimit.middleware.js';

// Import services
import { initDatabase } from './services/database.service.js';
import { startSchedulers } from './services/scheduler.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Environment configuration
const PORT = parseInt(process.env.PORT || '8000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// ============================================
// Security Middleware
// ============================================
app.use(helmet({
  contentSecurityPolicy: isProduction,
  crossOriginEmbedderPolicy: isProduction,
}));

// ============================================
// CORS Configuration
// ============================================
const corsOrigins = process.env.CORS_ALLOW_ORIGINS?.split(',').map(o => o.trim()) || ['*'];
app.use(cors({
  origin: corsOrigins,
  credentials: corsOrigins[0] !== '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ============================================
// General Middleware
// ============================================
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (!isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// Rate Limiting
// ============================================
app.use('/api/', rateLimiter);

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'nodejs',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============================================
// API Routes
// ============================================
const API_PREFIX = '/api';

// Authentication routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// User routes
app.use(`${API_PREFIX}/users`, userRoutes);

// Calculator routes
app.use(`${API_PREFIX}/calculators`, calculatorRoutes);
app.use(`${API_PREFIX}/calculators`, calculatorRoutes); // Also available at /calculators for backward compatibility

// Workflow routes
app.use(`${API_PREFIX}/workflows`, workflowRoutes);

// Equation routes
app.use(`${API_PREFIX}/equations`, equationRoutes);

// Pipeline routes
app.use(`${API_PREFIX}/pipelines`, pipelineRoutes);
app.use(`${API_PREFIX}/calculation-pipeline`, pipelineRoutes);

// Analytics routes
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

// Visual Data Analysis routes
app.use(`${API_PREFIX}/vda`, vdaRoutes);

// Learning routes
app.use(`${API_PREFIX}/learning`, learningRoutes);

// Payment routes
app.use(`${API_PREFIX}/payments`, paymentRoutes);

// AI routes
app.use(`${API_PREFIX}/ai`, aiRoutes);

// Project routes
app.use(`${API_PREFIX}/projects`, projectRoutes);

// Post/Comment routes
app.use(`${API_PREFIX}/posts`, postRoutes);

// Price routes
app.use(`${API_PREFIX}/prices`, priceRoutes);

// Canvas routes
app.use(`${API_PREFIX}/canvas`, canvasRoutes);

// Hostinger integration routes
app.use(`${API_PREFIX}/hostinger`, hostingerRoutes);

// Admin routes
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Report routes
app.use(`${API_PREFIX}/reports`, reportRoutes);

// Local engineering pipeline routes (no DB dependency, real calculations)
app.use(`${API_PREFIX}/local-pipelines`, localPipelinesRoutes);

// ============================================
// Static File Serving (Development)
// ============================================
if (!isProduction) {
  const uploadsPath = join(__dirname, '../uploads');
  const staticPath = join(__dirname, '../public');
  
  app.use('/uploads', express.static(uploadsPath));
  app.use('/static', express.static(staticPath));
}

// ============================================
// Serve React Frontend
// ============================================
const frontendPath = join(__dirname, '../frontend-react/dist');
const frontendIndex = join(frontendPath, 'index.html');

// Serve static files from React build
app.use(express.static(frontendPath));

// Serve React app for all non-API routes (SPA fallback)
app.get('*', (req, res, next) => {
  // Skip API routes and let them404 naturally
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Check if index.html exists
  if (existsSync(frontendIndex)) {
    res.sendFile(frontendIndex);
  } else {
    res.status(200).json({
      message: 'EngiSuite API Server',
      version: '1.0.0',
      note: 'Frontend not built. Run "cd frontend-react && npm run build" to build the frontend.',
      apiDocs: '/api',
      health: '/health'
    });
  }
});

// ============================================
// Error Handling
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Server Initialization
// ============================================
async function startServer() {
  try {
    // Initialize database connection
    await initDatabase();
    console.log('✅ Database initialized');

    // Start schedulers (subscription checks, backups, etc.)
    startSchedulers();
    console.log('✅ Schedulers started');

    // Start listening
    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 EngiSuite Analytics - Node.js Server                   ║
║                                                              ║
║   Environment: ${NODE_ENV.padEnd(45)}║
║   Port:        ${PORT.toString().padEnd(45)}║
║   API URL:     http://localhost:${PORT}/api`.padEnd(60) + '║' + `
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, server };
