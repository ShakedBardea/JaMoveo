import { io, Socket } from 'socket.io-client';

const URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3001';

export const socket: Socket = io(URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'], // אם רואה 400 על polling: ['websocket'] בלבד
  autoConnect: false,                   // לא להתחבר אוטומטית
});

export function connectWithAuth(user: { id: string; username: string; instrument?: string; isAdmin?: boolean }) {
  // נעביר פרטים ב-handshake.auth
  socket.auth = { userId: user.id, username: user.username };
  if (!socket.connected) socket.connect();
}


// ניתוק נקי (לוגאאוט/עזיבת דף)
export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

// לוגים
socket.on('connect', () => console.log('✅ socket connected', socket.id));
socket.on('connect_error', (err) => console.error('❌ connect_error', err?.message || err));
socket.on('error', (e) => console.error('❌ socket error', e));