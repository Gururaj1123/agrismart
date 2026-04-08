const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. IMPROVED CORS FOR SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, "https://agrismart-inky.vercel.app", "http://localhost:5173"],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 2. IMPROVED CORS FOR EXPRESS
// This handles the "Preflight" requests that were failing in your browser
app.use(cors({ 
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.CLIENT_URL, "https://agrismart-inky.vercel.app", "http://localhost:5173"];
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.CLIENT_URL === '*') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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

// Socket.io setup
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});
app.set('io', io);

app.get('/', (req, res) => res.json({ message: 'AgriSmart API Running' }));

// 3. DATABASE AND SERVER START
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    
    const PORT = process.env.PORT || 5000;
    
    // CRITICAL: Added '0.0.0.0' so Render can route traffic to the container
    server.listen(PORT, '0.0.0.0', () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('MongoDB error:', err);
    process.exit(1); // Stop the server if DB fails to connect
  });