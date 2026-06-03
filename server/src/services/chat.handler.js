const { prisma } = require('../config/db');
const chatService = require('../services/chat.service');
const { sendMessage } = require('../services/gemini.service');

async function handleMessage({ chatId, userId, content, language }) {
  const chat = await chatService.getChat(chatId, userId);
  if (!chat) {
    const err = new Error('Chat not found');
    err.statusCode = 404;
    throw err;
  }

  const messages = Array.isArray(chat.messages) ? chat.messages : [];
  const conversationHistory = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const userMsg = await chatService.appendMessage(chatId, userId, 'user', content);

  let assistantContent = '';
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true,
        region: true, woreda: true, farmSize: true, crops: true,
      },
    });

    const farms = await prisma.farm.findMany({
      where: { farmerId: userId, isActive: true },
      select: {
        id: true, name: true, region: true, woreda: true,
        size: true, soilType: true, soilColor: true,
        nitrogen: true, phosphorus: true, potassium: true,
        ph: true, temperature: true, humidity: true, rainfall: true,
        latitude: true, longitude: true,
      },
    });

    const result = await sendMessage({
      message: content,
      conversationHistory,
      language: language || 'en',
      userContext: {
        role: user?.role || 'FARMER',
        region: user?.region || null,
        woreda: user?.woreda || null,
        name: user?.name || null,
        farms,
      },
    });
    assistantContent = result.text || '';
  } catch (aiErr) {
    assistantContent = 'Sorry, I encountered an error processing your request.';
    console.error('[AI Chat Error]', aiErr);
  }

  const assistantMsg = await chatService.appendMessage(chatId, userId, 'assistant', assistantContent);

  if (messages.length === 0 && content.length > 0) {
    const title = content.length > 50 ? content.slice(0, 50) + '...' : content;
    await chatService.updateChatTitle(chatId, userId, title).catch(() => {});
  }

  return { userMessage: userMsg, assistantMessage: assistantMsg };
}

module.exports = { handleMessage };