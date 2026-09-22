// Import required packages
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Serve uploaded images so they can be viewed in the browser
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'linkup-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Send index.html when user visits the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sign Up route
app.post('/signup', async (req, res) => {
  const { name, age, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (name, age, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, age, email, hashedPassword]
    );

    res.status(201).json({ message: 'Account created successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Save user info in the session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.status(200).json({ message: 'Login successful', user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Check current logged-in user (useful for the chat page)
app.get('/current-user', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// Get all previous chat messages (for loading chat history)
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT username, text, image_url, created_at FROM messages ORDER BY created_at ASC LIMIT 100'
    );
    res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Could not load messages' });
  }
});

// Image upload route
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// Handle real-time connections with Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user sends a message, broadcast it (with sender info + time) to everyone
  socket.on('chat message', async (data) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Save the message to the database (text and/or image URL)
    try {
      await pool.query(
        'INSERT INTO messages (username, text, image_url) VALUES ($1, $2, $3)',
        [data.username, data.text || null, data.imageUrl || null]
      );
    } catch (err) {
      console.error('Error saving message:', err);
    }

    // Broadcast the message to everyone
    io.emit('chat message', {
      text: data.text,
      imageUrl: data.imageUrl,
      username: data.username,
      senderId: socket.id,
      time: time,
    });
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});