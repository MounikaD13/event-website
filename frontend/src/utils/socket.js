import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export const createSocket = () => io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});
