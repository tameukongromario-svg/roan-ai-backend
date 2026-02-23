import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import chatRoutes from './routes/chat.routes';
import generationRoutes from './routes/generation.routes';
import authRoutes from './routes/auth.routes';
import selfUpdateRoutes from './routes/self-update.routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/generate', generationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/self-update', selfUpdateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uploads: {
      images: '/uploads/images',
      videos: '/uploads/videos',
      documents: '/uploads/documents'
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Listen on all network interfaces (0.0.0.0) for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ROAN AI Server running on port ${PORT}`);
  console.log(`📡 Local models available via Ollama`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, '../uploads')}`);
  console.log(`🔐 Auth system enabled`);
  console.log(`🤖 Self-update system enabled`);
});