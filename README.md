# Real-Time Chat App

A simple real-time chat application that allows multiple users to send and receive messages instantly, without refreshing the page. Built as a learning project to understand how full-stack web applications work — from frontend to backend to database.

## Features

- Real-time messaging using WebSockets (no page reload needed)
- Multiple users can join and chat simultaneously
- Messages are broadcast instantly to all connected users
- Chat history stored in a PostgreSQL database
- Clean and simple user interface
- Environment variables used to keep sensitive data (like DB credentials) secure

## Tech Stack

**Backend**
- Node.js – JavaScript runtime for the server
- Express.js – Web framework for handling routes and requests
- Socket.io – Enables real-time, bidirectional communication between client and server

**Database**
- PostgreSQL – Relational database used to store users and message history
- pg – PostgreSQL client for Node.js

**Frontend**
- HTML, CSS, JavaScript – Simple and lightweight client-side interface

**Other Tools**
- dotenv – Manages environment variables securely
- nodemon – Automatically restarts the server during development
- Git & GitHub – Version control and project hosting

## How It Works

1. The Express server serves the frontend files and handles HTTP requests.
2. When a user opens the app, a WebSocket connection is established via Socket.io.
3. When a user sends a message, the server receives it and instantly broadcasts it to all connected clients.
4. Messages are also saved to a PostgreSQL database so chat history isn't lost on refresh.

## Getting Started

```bash
git clone https://github.com/your-username/realtime-chat-app.git
cd realtime-chat-app
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.