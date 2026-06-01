const jwt = require('jsonwebtoken');
const chatService = require('./services/chat.service');
const agriaiService = require('./services/agriai.service');

function setupChatSocket(io) {
  const chatNamespace = io.of('/chat');

  chatNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  chatNamespace.on('connection', (socket) => {
    console.log(`Chat socket connected: user ${socket.userId}`);

    socket.on('chat:join', async ({ chatId }) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('chat:message', async ({ chatId, content }) => {
      if (!content || !content.trim()) return;

      try {
        let chat = await chatService.getChat(chatId, socket.userId);
        if (!chat) {
          chat = await chatService.createChat(socket.userId, 'New Chat');
          chatId = chat.id;
          socket.join(`chat:${chatId}`);
          socket.emit('chat:created', { chatId, chat });
        }

        await chatService.addMessage(chatId, socket.userId, 'user', content);

        const conversationHistory = (chat.messages || []).map(m => ({
          role: m.role,
          content: m.content,
        }));
        conversationHistory.push({ role: 'user', content });

        const aiResponse = await agriaiService.sendChatMessage({
          message: content,
          conversation_history: conversationHistory,
          user_id: socket.userId,
        });

        const assistantMessage = await chatService.addMessage(
          chatId, socket.userId, 'assistant',
          aiResponse.text,
          aiResponse.functionCalls ? { functionCalls: aiResponse.functionCalls } : undefined
        );

        if (chat.messages.length === 0) {
          const title = content.length > 50 ? content.slice(0, 50) + '...' : content;
          await chatService.updateChatTitle(chatId, socket.userId, title);
        }

        socket.emit('chat:response', {
          chatId,
          message: assistantMessage,
          functionCalls: aiResponse.functionCalls || [],
        });
      } catch (error) {
        socket.emit('chat:error', {
          message: error.message || 'Failed to process message',
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Chat socket disconnected: user ${socket.userId}`);
    });
  });
}

module.exports = { setupChatSocket };
