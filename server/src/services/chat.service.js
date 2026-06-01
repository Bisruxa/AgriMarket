const { prisma } = require('../config/db');

const WINDOW_SIZE = 20;
let msgCounter = 0;

function buildMessage(role, content, metadata) {
  return {
    id: `msg_${Date.now()}_${++msgCounter}`,
    role,
    content,
    ...(metadata ? { metadata } : {}),
    createdAt: new Date().toISOString(),
  };
}

function trimHistory(messages, windowSize = WINDOW_SIZE) {
  if (messages.length <= windowSize * 2) return messages;
  return messages.slice(-windowSize * 2);
}

async function getChats(userId) {
  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  return chats.map(({ messages, ...chat }) => ({
    ...chat,
    messages: Array.isArray(messages) ? messages : [],
  }));
}

async function getChat(chatId, userId) {
  return prisma.chat.findFirst({
    where: { id: chatId, userId },
  });
}

async function createChat(userId, title) {
  return prisma.chat.create({
    data: { userId, title: title || 'New Chat' },
  });
}

async function deleteChat(chatId, userId) {
  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
  if (!chat) return null;
  return prisma.chat.delete({ where: { id: chatId } });
}

async function appendMessage(chatId, userId, role, content, metadata) {
  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
  if (!chat) return null;

  const messages = Array.isArray(chat.messages) ? chat.messages : [];
  const entry = buildMessage(role, content, metadata);

  await prisma.chat.update({
    where: { id: chatId },
    data: {
      messages: [...messages, entry],
      updatedAt: new Date(),
    },
  });

  return entry;
}

async function updateChatTitle(chatId, userId, title) {
  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
  if (!chat) return null;
  return prisma.chat.update({
    where: { id: chatId },
    data: { title, updatedAt: new Date() },
  });
}

module.exports = {
  getChats, getChat, createChat, deleteChat,
  appendMessage, updateChatTitle, trimHistory, buildMessage,
};
