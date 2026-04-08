const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. SOCKET.IO CORS CONFIGURATION
const io = new Server(server, {
  cors: {
    // Explicitly listing origins to prevent handshake errors
    origin: [
      process.env.CLIENT_URL, 
      "https://agrismart-inky.vercel.app", 
      "http://localhost:5173"
    ].filter(Boolean), // Filters out undefined if CLIENT_URL isn't set yet
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 2. EXPRESS CORS CONFIGURATION
app.use(cors({ 
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL, 
      "https://agrismart-inky.vercel.app", 
      "http://localhost:5173"
    ];
    // Allow requests with no origin (like mobile apps) or if in allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.CLIENT_URL === '*') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/soil', require('./routes/soil'));
app.use('/api/disease', require('./routes/disease'));
app.use('/api/fertilizer', require('./routes/fertilizer'));
app.use('/api/community', require('./routes/community'));
app.use('/api/market', require('./routes/market'));
app.use('/api/admin', require('./routes/admin'));

// Socket.io for real-time market updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});
app.set('io', io);

// Health Check / Home Route
app.get('/', (req, res) => res.json({ message: 'AgriSmart API Running Successfully' }));

// 3. DATABASE AND SERVER START
mongoose.set('strictQuery', false); // Optional: suppresses Mongoose 7 warning
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    
    // Render uses process.env.PORT; fallback to 10000 for standard Render Web Services
    const PORT = process.env.PORT || 10000;
    
    // CRITICAL: Bind to '0.0.0.0' to ensure Cloudflare/Render Proxy connectivity
    server.listen(PORT, '0.0.0.0', () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });