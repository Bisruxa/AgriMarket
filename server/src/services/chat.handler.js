const chatService = require('../services/chat.service');
const { sendChatMessage } = require('../services/agriai.service');

async function handleMessage({ chatId, userId, content }) {
  const chat = await chatService.getChat(chatId, userId);
  if (!chat) {
    const err = new Error('Chat not found');
    err.statusCode = 404;
    throw err;
  }

  const userMsg = await chatService.appendMessage(chatId, userId, 'user', content);

  let assistantContent = '';
  try {
    const result = await sendChatMessage({
      message: content,
      conversation_history: [],
      user_id: userId,
    });
    assistantContent = result.text || '';
  } catch (aiErr) {
    assistantContent = 'Sorry, I encountered an error processing your request.';
    console.error('[AI Chat Error]', aiErr);
  }

  const assistantMsg = await chatService.appendMessage(chatId, userId, 'assistant', assistantContent);

  return { userMessage: userMsg, assistantMessage: assistantMsg };
}

module.exports = { handleMessage };