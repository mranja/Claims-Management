const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const connectDB = require('./config/db');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const claimRoutes = require('./routes/claimRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Core Middlewares - Enable Permissive CORS for dev compatibility
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ClaimIQ AI-Powered Healthcare API is healthy',
    timestamp: new Date(),
    version: '2.4.0',
  });
});

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);

if (process.env.NODE_ENV !== 'test') {
  const server = http.createServer(app);

  const startServer = (portToTry) => {
    server.listen(portToTry, () => {
      console.log(`🚀 ClaimIQ Server running on port ${portToTry} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${portToTry} is currently busy. Attempting port ${portToTry + 1}...`);
        setTimeout(() => {
          server.close();
          startServer(portToTry + 1);
        }, 1000);
      } else {
        console.error('Server error:', err.message);
      }
    });
  };

  startServer(PORT);
}

module.exports = app;
