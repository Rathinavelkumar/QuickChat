let ws = null;
let paired = false;

function connect() {
  const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    setStatus('Waiting for partner...');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.action === 'paired') {
      paired = true;
      setStatus('Paired! Start chatting.');
      showChat();
    } else if (data.action === 'waiting') {
      setStatus('Waiting for partner...');
    } else if (data.action === 'message') {
      addMessage(data.message, 'partner');
    } else if (data.action === 'partner_disconnected') {
      setStatus('Partner disconnected. Waiting for new partner...');
      paired = false;
      hideChat();
    } else if (data.action === 'error') {
      setStatus(data.message);
    }
  };

  ws.onclose = () => {
    setStatus('Disconnected. Refresh to reconnect.');
    hideChat();
  };
}

function setStatus(text) {
  document.getElementById('status').textContent = text;
}

function showChat() {
  document.getElementById('chat').classList.remove('hidden');
  document.getElementById('leaveBtn').classList.remove('hidden');
}

function hideChat() {
  document.getElementById('chat').classList.add('hidden');
  document.getElementById('leaveBtn').classList.add('hidden');
  document.getElementById('messages').innerHTML = '';
}

function addMessage(msg, who) {
  const el = document.createElement('div');
  el.className = 'message ' + who;
  el.textContent = msg;
  document.getElementById('messages').appendChild(el);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

document.getElementById('messageForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('messageInput');
  const msg = input.value.trim();
  if (msg && ws && paired) {
    ws.send(JSON.stringify({ message: msg }));
    addMessage(msg, 'me');
    input.value = '';
  }
});

document.getElementById('leaveBtn').addEventListener('click', function() {
  if (ws) ws.close();
  setStatus('You left the chat. Refresh to reconnect.');
  hideChat();
});

connect();
