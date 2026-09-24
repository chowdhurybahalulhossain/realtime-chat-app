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
const imageInput = document.getElementById('image-input');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPanel = document.getElementById('emoji-panel');

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
      window.location.href = 'login.html';
      return;
    }

    const data = await response.json();
    username = data.user.name;
    socket.emit('user online', username);

    chatContainer.style.display = 'flex';
    input.focus();

    loadPreviousMessages();

  } catch (err) {
    console.error('Failed to check login status:', err);
    window.location.href = 'login.html';
  }
}

checkLogin();

// Load and display previous messages from the database
async function loadPreviousMessages() {
  try {
    const response = await fetch('/messages');
    const data = await response.json();

    data.messages.forEach((msg) => {
      displayMessage({
        text: msg.text,
        imageUrl: msg.image_url,
        username: msg.username,
        senderId: null,
        time: new Date(msg.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    });
  } catch (err) {
    console.error('Failed to load previous messages:', err);
  }
}

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

  if (input.value.trim()) {
    socket.emit('chat message', { text: input.value, username });
    socket.emit('stop typing');
    input.value = '';
  } else {
    // Input is empty — send a thumbs up
    socket.emit('chat message', { text: '👍', username });
  }

  updateSendButton();
});

// Show a like button when the input is empty, send button when it has text
const sendBtn = form.querySelector('button[type="submit"]');

function updateSendButton() {
  if (input.value.trim() === '') {
    sendBtn.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
    sendBtn.classList.add('like-btn');
  } else {
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
    sendBtn.classList.remove('like-btn');
  }
}

input.addEventListener('input', updateSendButton);
updateSendButton(); // set initial state

// Detect typing and notify the server
input.addEventListener('input', () => {
  socket.emit('typing', username);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop typing');
  }, 1000);
});

// Clicking the attach icon opens the hidden file picker
attachBtn.addEventListener('click', () => {
  imageInput.click();
});

// Common emojis for the picker
const emojiList = [
  '😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡',
  '👍', '👎', '❤️', '🔥', '🎉', '🙏', '👏', '💯',
  '😊', '😭', '🥳', '😴', '🤗', '😉', '🙌', '✨'
];

// Build the emoji panel
emojiList.forEach((emoji) => {
  const span = document.createElement('span');
  span.textContent = emoji;
  span.classList.add('emoji-item');
  span.addEventListener('click', () => {
    input.value += emoji;
    input.focus();
    emojiPanel.classList.remove('show');
  });
  emojiPanel.appendChild(span);
});

// Toggle the emoji panel when clicking the emoji icon
emojiBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  emojiPanel.classList.toggle('show');
});

// Close the panel if clicking anywhere else
document.addEventListener('click', (e) => {
  if (!emojiPanel.contains(e.target) && e.target !== emojiBtn) {
    emojiPanel.classList.remove('show');
  }
});

// When the user selects an image, upload it
imageInput.addEventListener('change', async () => {
  const file = imageInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Failed to upload image');
      return;
    }

    // Send the image message through Socket.io
    socket.emit('chat message', { text: '', imageUrl: data.imageUrl, username });

  } catch (err) {
    console.error('Image upload failed:', err);
    alert('Could not upload image. Please try again.');
  } finally {
    imageInput.value = ''; // reset so the same file can be selected again later
  }
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

// Update the online users panel
socket.on('online users', (users) => {
  const list = document.getElementById('online-users-list');
  if (!list) return;

  const uniqueUsers = [...new Set(users)];

  list.innerHTML = '';
  uniqueUsers.forEach((name) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="user-avatar" style="background-color: ${getAvatarColor(name)}">
        ${name.charAt(0).toUpperCase()}
      </div>
      <span>${name}</span>
    `;
    list.appendChild(li);
  });
});

// Reusable function to display a single message in the chat
function displayMessage(data) {
  const item = document.createElement('li');
  const isOwnMessage = data.senderId === socket.id || data.username === username;

  item.classList.add(isOwnMessage ? 'own-message' : 'other-message');

  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.classList.add('bubble-wrapper');

  const nameLabel = document.createElement('div');
  nameLabel.classList.add('sender-name');
  nameLabel.textContent = isOwnMessage ? 'You' : data.username;

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');

  if (data.imageUrl) {
    // Display an image message
    bubble.classList.add('image-bubble');
    const img = document.createElement('img');
    img.src = data.imageUrl;
    img.classList.add('chat-image');
    bubble.appendChild(img);
  } else {
    // Display a text message
    bubble.textContent = data.text;
  }

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
}

// When a message is received live from the server, display it
socket.on('chat message', (data) => {
  displayMessage(data);
});

// Toggle the online users info panel
const infoBtn = document.getElementById('info-btn');
const infoPanel = document.getElementById('info-panel');
const closeInfoBtn = document.getElementById('close-info-btn');

infoBtn.addEventListener('click', () => {
  infoPanel.classList.add('show');
});

closeInfoBtn.addEventListener('click', () => {
  infoPanel.classList.remove('show');
});