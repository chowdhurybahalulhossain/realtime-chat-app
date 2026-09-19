// Connect to the server using Socket.io
const socket = io();

// Grab the HTML elements we need
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// When the form is submitted (user sends a message)
form.addEventListener('submit', (e) => {
  e.preventDefault(); // stop the page from refreshing

  if (input.value) {
    // Send the message to the server
    socket.emit('chat message', input.value);

    // Clear the input box
    input.value = '';
  }
});

// When a message is received from the server, display it
socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);

  // Auto-scroll to the latest message
  messages.scrollTop = messages.scrollHeight;
});