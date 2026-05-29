"use client";

import * as React from "react";
import { ChatHistory } from "./ChatHistory";
import { Chats } from "./Chats";
import { initSocket, joinChat, leaveChat, sendMessage, disconnectSocket, getSocket } from "@/lib/chat";
import { API_URL } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface ChatItem {
  id: string;
  title: string;
  createdAt: string;
  isActive: boolean;
  messages?: { content: string; role: string }[];
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
  return d.toLocaleDateString();
}

export default function ChatPage() {
  const [chatItems, setChatItems] = React.useState<ChatItem[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAiTyping, setIsAiTyping] = React.useState(false);

  React.useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      initSocket(token);
      loadChats();
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  React.useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("chat:response", (data: { chatId: string; message: any; functionCalls: any[] }) => {
      setIsAiTyping(false);
      const msg: Message = {
        id: data.message.id,
        role: "assistant",
        content: data.message.content,
        timestamp: formatTime(data.message.createdAt),
      };
      setMessages((prev) => [...prev, msg]);
      loadChats();
    });

    socket.on("chat:error", (data: { message: string }) => {
      setIsAiTyping(false);
      const msg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Error: ${data.message}`,
        timestamp: "now",
      };
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat:response");
      socket.off("chat:error");
    };
  }, []);

  async function loadChats() {
    try {
      const res = await fetch(`${API_URL}/chat`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setChatItems(
          json.data.map((c: any) => ({
            id: c.id,
            title: c.title || "New Chat",
            createdAt: c.createdAt,
            isActive: c.id === currentChatId,
            messages: c.messages,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load chats", e);
    }
  }

  async function loadMessages(chatId: string) {
    try {
      const res = await fetch(`${API_URL}/chat/${chatId}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setMessages(
          json.data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: formatTime(m.createdAt),
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  }

  async function handleNewChat() {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "New Chat" }),
      });
      const json = await res.json();
      if (json.success) {
        const chat = json.data;
        setCurrentChatId(chat.id);
        setMessages([]);
        setChatItems((prev) => [
          { id: chat.id, title: chat.title, createdAt: chat.createdAt, isActive: true },
          ...prev.map((c) => ({ ...c, isActive: false })),
        ]);
      }
    } catch (e) {
      console.error("Failed to create chat", e);
    }
  }

  async function handleSelectChat(id: string) {
    setCurrentChatId(id);
    joinChat(id);
    setChatItems((prev) =>
      prev.map((c) => ({ ...c, isActive: c.id === id }))
    );
    await loadMessages(id);
  }

  async function handleSendMessage(content: string) {
    if (!currentChatId) {
      await handleNewChat();
    }
    const chatId = currentChatId;

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      timestamp: "now",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    sendMessage(chatId!, content);
  }

  const currentChatTitle =
    chatItems.find((c) => c.isActive)?.title || "AgriAI Assistant";

  return (
    <div className="max-w-325 w-full h-[90vh] max-h-200 bg-white flex overflow-hidden">
      <ChatHistory
        items={chatItems}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <Chats
        currentChatTitle={currentChatTitle}
        messages={messages}
        isAiTyping={isAiTyping}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
