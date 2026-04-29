import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    // Track room membership globally on the singleton
    socket._joinedRooms = new Set();

    socket.on('connect', () => {
      // Re-join rooms on reconnection
      socket._joinedRooms.forEach(room => {
        socket.emit(room);
      });
    });
  }
  return socket;
};

export const joinAdminRoom = () => {
  const s = getSocket();
  if (!s._joinedRooms.has('join_admin_room')) {
    s.emit('join_admin_room');
    s._joinedRooms.add('join_admin_room');
  }
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  const roomKey = `join_user_room:${userId}`;
  if (!s._joinedRooms.has(roomKey)) {
    s.emit('join_user_room', userId);
    s._joinedRooms.add(roomKey);
  }
};

// For backward compatibility
export const createSocket = () => getSocket();

