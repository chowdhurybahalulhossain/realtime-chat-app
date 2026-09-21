// Connect to the server using Socket.io
const socket = io();

// Chat elements
const chatContainer = document.getElementById('chat-container');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const onlineCount = document.getElementById('online-count');
const typingIndicator = document.getElementById('typing-indicator');
const attachBtn = document.getElementById('attach-btn');
const logoutBtn = document.getElementById('logout-btn');

let username = '';
let typingTimeout;

// Generate a consistent color based on the username (for the avatar)
function getAvatarColor(name) {
  const colors = ['#4a76a8', '#a84a76', '#76a84a', '#a8874a', '#874aa8', '#4aa8a3'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Check if the user is logged in before showing the chat
async function checkLogin() {
  try {
    const response = await fetch('/current-user');

    if (!response.ok) {
      // Not logged in — send them to the login page
      window.location.href = 'login.html';
      return;
    }

    const data = await response.json();
    username = data.user.name;

    // Show the chat screen now that we know who the user is
    chatContainer.style.display = 'flex';
    input.focus();

  } catch (err) {
    console.error('Failed to check login status:', err);
    window.location.href = 'login.html';
  }
}

checkLogin();

// Handle logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/logout', { method: 'POST' });
      window.location.href = 'login.html';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  });
}

// When the form is submitted (user sends a message)
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit('chat message', { text: input.value, username });
    socket.emit('stop typing');
    input.value = '';
  }
});

// Detect typing and notify the server
input.addEventListener('input', () => {
  socket.emit('typing', username);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop typing');
  }, 1000);
});

// Placeholder for the image-sending feature
attachBtn.addEventListener('click', () => {
  alert('Image sending feature coming soon!');
});

// Show typing indicator when someone else is typing
socket.on('typing', (name) => {
  typingIndicator.textContent = `${name} is typing...`;
});

// Hide typing indicator
socket.on('stop typing', () => {
  typingIndicator.textContent = '';
});

// Update online user count
socket.on('online count', (count) => {
  onlineCount.textContent = `${count} online`;
});

// When a message is received from the server, display it
socket.on('chat message', (data) => {
  const item = document.createElement('li');
  const isOwnMessage = data.senderId === socket.id;

  item.classList.add(isOwnMessage ? 'own-message' : 'other-message');

  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.classList.add('bubble-wrapper');

  const nameLabel = document.createElement('div');
  nameLabel.classList.add('sender-name');
  nameLabel.textContent = isOwnMessage ? 'You' : data.username;

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = data.text;

  const time = document.createElement('div');
  time.classList.add('timestamp');
  time.textContent = data.time;

  bubbleWrapper.appendChild(nameLabel);
  bubbleWrapper.appendChild(bubble);
  bubbleWrapper.appendChild(time);

  if (isOwnMessage) {
    item.appendChild(bubbleWrapper);
  } else {
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = data.username.charAt(0).toUpperCase();
    avatar.style.backgroundColor = getAvatarColor(data.username);

    item.appendChild(avatar);
    item.appendChild(bubbleWrapper);
  }

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});