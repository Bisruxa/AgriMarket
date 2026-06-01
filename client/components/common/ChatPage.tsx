"use client";

import * as React from "react";
import { ChatHistory } from "./ChatHistory";
import { Chats } from "./Chats";
import { API_URL, chatApi } from "@/lib/api";
import { useGeminiLive } from "@/lib/useGeminiLive";
import { Language, Voice } from "@/types/real-time";

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
  timestamp: string;
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
  const [liveStatus, setLiveStatus] = React.useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'>('idle');
  const [isLive, setIsLive] = React.useState(false);
  const [liveLanguage, setLiveLanguage] = React.useState<Language>(Language.ENGLISH);
  const [liveVoice, setLiveVoice] = React.useState<Voice>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('gemini-voice') as Voice) || 'Zephyr';
    }
    return 'Zephyr';
  });

  React.useEffect(() => {
    localStorage.setItem('gemini-voice', liveVoice);
  }, [liveVoice]);

  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  const live = useGeminiLive(GEMINI_API_KEY, liveLanguage, liveVoice, {
    onTurnComplete: (userText, modelText) => {
      const newMsgs: Message[] = [];
      if (userText) {
        newMsgs.push({
          id: `live-user-${Date.now()}`,
          role: 'user',
          content: userText,
          timestamp: 'now',
        });
      }
      if (modelText) {
        newMsgs.push({
          id: `live-model-${Date.now()}`,
          role: 'assistant',
          content: modelText,
          timestamp: 'now',
        });
      }
      if (newMsgs.length > 0) {
        setMessages(prev => [...prev, ...newMsgs]);
      }
    },
    onStatusChange: (status) => {
      setLiveStatus(
        status === 'connected' ? 'connected' :
        status === 'idle' ? 'idle' :
        status === 'error' ? 'error' : 'connecting'
      );
      setIsLive(status === 'connected');
    },
    onError: (error) => {
      const errMsg: Message = {
        id: `live-err-${Date.now()}`,
        role: 'assistant',
        content: `Voice error: ${error}`,
        timestamp: 'now',
      };
      setMessages(prev => [...prev, errMsg]);
    },
  });

  const handleToggleLive = React.useCallback(() => {
    if (isLive) {
      live.closeSession();
      setIsLive(false);
      setLiveStatus('idle');
    } else {
      if (!GEMINI_API_KEY) {
        setLiveStatus('error');
        const errMsg: Message = {
          id: `live-err-${Date.now()}`,
          role: 'assistant',
          content: 'Error: Gemini API key not set. Set NEXT_PUBLIC_GEMINI_API_KEY in your environment.',
          timestamp: 'now',
        };
        setMessages(prev => [...prev, errMsg]);
        return;
      }
      live.startSession();
    }
  }, [isLive, live, GEMINI_API_KEY]);

  React.useEffect(() => {
    return () => {
      live.closeSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    loadChats();
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
            timestamp: c.createdAt,
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

  async function handleNewChat(): Promise<string | null> {
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
          { id: chat.id, title: chat.title, createdAt: chat.createdAt, timestamp: chat.createdAt, isActive: true },
          ...prev.map((c) => ({ ...c, isActive: false })),
        ]);
        return chat.id;
      }
    } catch (e) {
      console.error("Failed to create chat", e);
    }
    return null;
  }

  async function handleSelectChat(id: string) {
    if (currentChatId && currentChatId !== id) {
      // no-op for now, no socket to leave
    }
    setCurrentChatId(id);
    setChatItems((prev) =>
      prev.map((c) => ({ ...c, isActive: c.id === id }))
    );
    await loadMessages(id);
  }

  async function handleSendMessage(content: string) {
    const chatId = currentChatId || (await handleNewChat());
    if (!chatId) return;

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      timestamp: "now",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const result = await chatApi.sendMessage(chatId, content);
    setIsLoading(false);

    if (!result.success) {
      const errMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: result.message || "Text chat is disabled. Please use the live voice feature to talk with AgriAI.",
        timestamp: "now",
      };
      setMessages((prev) => [...prev, errMsg]);
    }
    loadChats();
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
        isAiTyping={isLoading}
        onSendMessage={handleSendMessage}
        isLive={isLive}
        liveStatus={liveStatus}
        onToggleLive={handleToggleLive}
        liveLanguage={liveLanguage}
        onLiveLanguageChange={setLiveLanguage}
        liveVoice={liveVoice}
        onLiveVoiceChange={setLiveVoice}
        isMuted={live.isMuted}
        onToggleMute={live.toggleMute}
      />
    </div>
  );
}
