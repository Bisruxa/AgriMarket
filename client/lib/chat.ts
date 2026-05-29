import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(token: string): Socket {
  if (socket?.connected) return socket;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const baseUrl = API_URL.replace('/api', '');

  socket = io(`${baseUrl}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Chat socket connected');
  });

  socket.on('connect_error', (err) => {
    console.error('Chat socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Chat socket disconnected:', reason);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinChat(chatId: string): void {
  socket?.emit('chat:join', { chatId });
}

export function leaveChat(chatId: string): void {
  socket?.emit('chat:leave', { chatId });
}

export function sendMessage(chatId: string, content: string): void {
  socket?.emit('chat:message', { chatId, content });
}
