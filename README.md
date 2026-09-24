# 🔗 LinkUp — Real-Time Chat App

A full-stack, real-time chat application built with Node.js, Express, Socket.io, and PostgreSQL. Users can sign up, log in, and chat instantly with images, emojis, and live typing indicators — all in a modern, responsive interface.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the App](#-running-the-app)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Email/password Sign Up and Login with securely hashed passwords (bcrypt) |
| 🔄 **Session persistence** | Stay logged in across page reloads using server-side sessions |
| ⚡ **Real-time messaging** | Instant message delivery with Socket.io — no page refresh needed |
| 💾 **Message history** | All messages saved in PostgreSQL, so chat history persists between visits |
| 🖼️ **Image sharing** | Upload and send images directly in the chat |
| 😊 **Emoji picker** | Quick-access emoji panel for expressive messaging |
| ✍️ **Typing indicator** | See when someone else is typing, in real time |
| 👥 **Online users panel** | View everyone currently online, updated live |
| 👍 **Quick-react** | Send an empty message to instantly send a 👍 (like Messenger) |
| 🎨 **Theme customization** | Switch between light/dark mode and choose from multiple background themes |
| 📱 **Responsive design** | Full-screen layout that adapts to desktop, tablet, and mobile |
| ✨ **Modern UI** | Clean, gradient-based design with smooth animations throughout |

---

## 🛠 Tech Stack

**Backend**
- [Node.js](https://nodejs.org/) — JavaScript runtime
- [Express.js](https://expressjs.com/) — Web framework for routing and requests
- [Socket.io](https://socket.io/) — Real-time, bidirectional communication
- [bcrypt](https://www.npmjs.com/package/bcrypt) — Password hashing
- [express-session](https://www.npmjs.com/package/express-session) — Login session management
- [multer](https://www.npmjs.com/package/multer) — Image upload handling

**Database**
- [PostgreSQL](https://www.postgresql.org/) — Stores user accounts and message history
- [pg](https://www.npmjs.com/package/pg) — PostgreSQL client for Node.js

**Frontend**
- HTML, CSS, JavaScript — No frameworks, built from scratch
- [Font Awesome](https://fontawesome.com/) — Icons

**Dev Tools**
- [dotenv](https://www.npmjs.com/package/dotenv) — Environment variable management
- [nodemon](https://www.npmjs.com/package/nodemon) — Auto-restart during development
- Git & GitHub — Version control

---

## 📸 Screenshots

> Add your own screenshots here! Example:
>
> | Login | Chat |
> |---|---|
> | ![Login](docs/screenshots/login.png) | ![Chat](docs/screenshots/chat.png) |

---

## ⚙️ How It Works

1. A new user signs up on the **Sign Up** page (name, birthdate, email, password). The password is hashed with bcrypt before being saved to PostgreSQL.
2. Returning users log in on the **Login** page; credentials are verified against the database.
3. On successful login, a session cookie keeps the user signed in — no need to log in again on every page load.
4. Once inside the chat, the browser connects to the server via **Socket.io** and loads previous messages from PostgreSQL.
5. When a message (text or image) is sent, it's saved to the database **and** instantly broadcast to every connected user.
6. Typing status and the online users list are also synced live through Socket.io events.
7. Theme and background preferences are saved in the browser's local storage, so they persist between visits.

---

## 📁 Project Structure

realtime-chat-app/
├── public/
│   ├── index.html        # Chat page
│   ├── login.html        # Login page
│   ├── signup.html       # Sign up page
│   ├── client.js          # Chat logic (Socket.io, messages, UI, theme)
│   ├── auth.js             # Sign up / login form logic
│   ├── style.css           # Chat page styling
│   └── auth.css             # Auth pages styling
├── uploads/                # Uploaded images (created automatically)
├── server.js               # Express + Socket.io server, all routes
├── db.js                    # PostgreSQL connection setup
├── .env                      # Environment variables (never committed)
├── .gitignore
└── package.json

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/download/) (with [pgAdmin](https://www.pgadmin.org/) recommended for beginners)
- [Git](https://git-scm.com/)

### Installation

Clone the repository and install dependencies:

git clone https://github.com/chowdhurybahalulhossain/realtime-chat-app.git
cd realtime-chat-app
npm install

---

## 🔑 Environment Variables

Create a file named `.env` in the project's root folder and add the following:

PORT=3000
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linkup_chat
SESSION_SECRET=any_random_secret_string

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default: 3000) |
| `DB_USER` | Your PostgreSQL username (default: `postgres`) |
| `DB_PASSWORD` | Your PostgreSQL password |
| `DB_HOST` | Database host (`localhost` for local development) |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DB_NAME` | Name of the database (see setup below) |
| `SESSION_SECRET` | Any random string, used to secure login sessions |

⚠️ **Never commit your `.env` file.** It's already listed in `.gitignore` to keep your credentials safe.

---

## 🗄 Database Setup

1. Open **pgAdmin** (or `psql`) and create a new database:

CREATE DATABASE linkup_chat;

2. Connect to the new database and create the required tables:

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

---

## ▶️ Running the App

Start the development server (auto-restarts on file changes):

npm run dev

You should see:

Server is running on http://localhost:3000
Database connected successfully at: ...

Open your browser and go to:

http://localhost:3000/signup.html

Create an account, log in, and start chatting! Open the app in two different browsers (or one normal + one incognito window) to test real-time messaging between two users.

---

## 🩺 Troubleshooting

| Problem | Likely Cause | Solution |
|---|---|---|
| `database "..." does not exist` | Database name mismatch or typo/space in the name | Double-check `DB_NAME` in `.env` matches the exact database name in pgAdmin |
| `password authentication failed` | Wrong password in `.env` | Confirm `DB_PASSWORD` matches your PostgreSQL password |
| Port 3000 already in use | Another process is using the port | Change `PORT` in `.env`, or stop the other process |
| Messages don't appear after refresh | `messages` table missing or `image_url` column not added | Re-run the table creation SQL above |
| Images disappear after refresh | `text` column has a `NOT NULL` constraint | Run: `ALTER TABLE messages ALTER COLUMN text DROP NOT NULL;` |
| Styles/scripts not updating | Browser cache | Hard refresh with `Ctrl + Shift + R` |
| Info/Theme panel buttons not responding | A leftover or duplicate reference in `client.js` (e.g. referencing an element that was removed) | Check the browser console (`F12`) for a `ReferenceError` and remove the stale line |

---

## 🗺 Roadmap

Planned features for future development:

- [ ] **Private 1-to-1 chat** — direct messaging with a contact sidebar, separate from the group chat
- [ ] **Voice & video calls** — real-time calling using WebRTC (UI placeholders already in place)
- [ ] **Deployment** — host the app on a live server so it's accessible online
- [ ] **Push notifications** — alert users of new messages when the tab isn't active
- [ ] **Message search** — search through chat history
- [ ] **Message reactions** — react to individual messages with emojis (beyond the current quick-like)
- [ ] **File sharing** — support documents and other file types, not just images
- [ ] **Read receipts** — show when a message has been seen

---

## 📄 License

This project was built for learning purposes as a first full-stack web development project.