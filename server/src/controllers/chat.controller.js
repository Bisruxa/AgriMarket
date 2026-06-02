const chatService = require('../services/chat.service');
const { handleMessage } = require('../services/chat.handler');

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

exports.appendMessage = async (req, res, next) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) {
      return res.status(400).json({ success: false, message: 'role and content are required' });
    }
    const entry = await chatService.appendMessage(
      req.params.id,
      req.user.id,
      role,
      content
    );
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const result = await handleMessage({
      chatId: req.params.id,
      userId: req.user.id,
      content: req.body.content,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error('[Chat Error]', error);
    res.status(500).json({ success: false, message: 'Failed to process message' });
  }
};
