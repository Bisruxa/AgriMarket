const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getChats(userId) {
  return prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { content: true, role: true },
      },
    },
  });
}

async function getChat(chatId, userId) {
  return prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
}

async function createChat(userId, title) {
  return prisma.chat.create({
    data: { userId, title: title || 'New Chat' },
  });
}

async function deleteChat(chatId, userId) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
  });
  if (!chat) return null;
  return prisma.chat.delete({ where: { id: chatId } });
}

async function addMessage(chatId, userId, role, content, metadata) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
  });
  if (!chat) return null;

  const message = await prisma.message.create({
    data: { chatId, role, content, metadata: metadata || undefined },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return message;
}

async function updateChatTitle(chatId, userId, title) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
  });
  if (!chat) return null;
  return prisma.chat.update({
    where: { id: chatId },
    data: { title, updatedAt: new Date() },
  });
}

module.exports = {
  getChats,
  getChat,
  createChat,
  deleteChat,
  addMessage,
  updateChatTitle,
};
