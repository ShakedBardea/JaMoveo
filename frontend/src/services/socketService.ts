import { io, Socket } from 'socket.io-client';

const URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3001';

// Socket.IO client - manual connection after authentication
export const socket: Socket = io(URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  autoConnect: false,
});
