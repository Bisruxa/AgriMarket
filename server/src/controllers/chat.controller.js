const chatService = require('../services/chat.service');
const agriaiService = require('../services/agriai.service');

exports.getChats = async (req, res, next) => {
  try {
    const chats = await chatService.getChats(req.user.id);
    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    next(error);
  }
};

exports.getChat = async (req, res, next) => {
  try {
    const chat = await chatService.getChat(req.params.id, req.user.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

exports.createChat = async (req, res, next) => {
  try {
    const chat = await chatService.createChat(req.user.id, req.body.title);
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

exports.deleteChat = async (req, res, next) => {
  try {
    const chat = await chatService.deleteChat(req.params.id, req.user.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { id: chatId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    let chat = await chatService.getChat(chatId, req.user.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const userMessage = await chatService.addMessage(
      chatId, req.user.id, 'user', content
    );

    const conversationHistory = chat.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    conversationHistory.push({ role: 'user', content });

    const aiResponse = await agriaiService.sendChatMessage({
      message: content,
      conversation_history: conversationHistory,
      user_id: req.user.id,
    });

    const assistantMessage = await chatService.addMessage(
      chatId, req.user.id, 'assistant',
      aiResponse.text,
      aiResponse.functionCalls ? { functionCalls: aiResponse.functionCalls } : undefined
    );

    if (chat.messages.length === 0) {
      const title = content.length > 50 ? content.slice(0, 50) + '...' : content;
      await chatService.updateChatTitle(chatId, req.user.id, title);
    }

    res.status(200).json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        functionCalls: aiResponse.functionCalls,
      },
    });
  } catch (error) {
    console.error('[Chat Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message',
    });
  }
};
