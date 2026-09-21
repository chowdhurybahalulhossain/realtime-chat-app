// Import required packages
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcrypt');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

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

// Handle real-time connections with Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user sends a message, broadcast it (with sender info + time) to everyone
  socket.on('chat message', (data) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    io.emit('chat message', {
      text: data.text,
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