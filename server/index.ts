import express from "express";
import { createServer } from "http";
import { connectToMongoDB } from './mongodb-connection.js';
import { registerMongoDBRoutes } from './mongodb-routes.js';
import { seedDevAdmin } from './seed-dev.js';
import { setupVite, serveStatic } from './vite.js';
import session from "express-session";
import cors from 'cors';
import dotenv from 'dotenv';
import { registerEvidenceRoutes } from './evidence-routes.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

function maskMongoUri(uri) {
  if (!uri) return "[NOT SET]";
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
}

console.log("Starting Police Management System with MongoDB Atlas...");
console.log(`MONGODB_URI = ${maskMongoUri(process.env.MONGODB_URI)}`);

const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'police-system-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  name: 'police.sid',
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Import mongoose models only once to prevent compilation errors

// Connect to MongoDB and start server
async function startServer() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectToMongoDB();

    // Connect with Mongoose for model operations
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      bufferCommands: false, // Disable mongoose buffering
    });
    console.log('✅ Mongoose connected successfully!');

    // Import models after mongoose connection is established
    await import('./mongodb-models.js');
    console.log('✅ Models imported successfully!');

    // Seed development admin user
    await seedDevAdmin();

    // Register MongoDB routes
    registerMongoDBRoutes(app);

    // Register additional API routes
    const { registerAdditionalRoutes } = await import('./api-routes.js');
    registerAdditionalRoutes(app);

    // Register evidence-specific routes
    registerEvidenceRoutes(app);

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        database: 'MongoDB Atlas',
        timestamp: new Date().toISOString()
      });
    });

    // Setup frontend serving
    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, server);
      console.log("🎨 Vite middleware configured for development");
    } else {
      serveStatic(app);
      console.log("📁 Serving static files for production");
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Police Management System running on port ${PORT}`);
      console.log(`🌐 Access your application at: http://0.0.0.0:${PORT}`);
      console.log(`💾 Using MongoDB Atlas for data storage`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();