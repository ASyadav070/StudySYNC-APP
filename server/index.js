import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import materialRoutes from './routes/materials.js';
import groupRoutes from './routes/groups.js';
import helmet from 'helmet'
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/register requests per 15 minutes
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});
// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);
app.set('prisma', prisma);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user's personal notification room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  // Join a group chat room
  socket.on('join_group_room', (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`Socket ${socket.id} joined group room: group_${groupId}`);
  });

  // Leave a group chat room
  socket.on('leave_group_room', (groupId) => {
    socket.leave(`group_${groupId}`);
    console.log(`Socket ${socket.id} left group room: group_${groupId}`);
  });

  // Handle user typing indicator (optional)
  socket.on('typing', ({ groupId, userEmail }) => {
    socket.to(`group_${groupId}`).emit('user_typing', { userEmail });
  });

  socket.on('stop_typing', ({ groupId, userEmail }) => {
    socket.to(`group_${groupId}`).emit('user_stop_typing', { userEmail });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudySync API is running' });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', materialRoutes);
app.use('/api', groupRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 StudySync server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
