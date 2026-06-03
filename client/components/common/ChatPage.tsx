'use client';

import * as React from "react";
import { ChatHistory } from "./ChatHistory";
import { Chats } from "./Chats";
import { chatApi } from "@/lib/api";
import { useGeminiLive } from "@/lib/useGeminiLive";
import { Language, Voice } from "@/types/real-time";
import { useLanguage } from "@/app/context/LanguageContext";
import { type AppLanguage, formatAppDate } from "@/lib/formatDate";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatItem {
  id: string;
  title: string;
  createdAt: string;
  timestamp: string;
  isActive: boolean;
  messages?: { content: string; role: string }[];
}

function formatTime(dateStr: string, language: AppLanguage): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
  return formatAppDate(d, language, "short");
}

const CURRENT_CHAT_ID_KEY = "agri_chat_current_id";

function chatDisplayTitle(chat: {
  title?: string;
  messages?: { role: string; content: string }[];
}): string {
  const title = (chat.title || "").trim();
  if (title && title !== "New Chat" && title !== "Voice Chat") return title;
  const firstUser = chat.messages?.find((m) => m.role === "user");
  if (firstUser?.content) {
    const cleaned = firstUser.content.replace(/\s+/g, " ").trim();
    if (!cleaned) return title || "New Chat";
    const max = 50;
    return cleaned.length <= max ? cleaned : `${cleaned.slice(0, max).trim()}…`;
  }
  return title || "New Chat";
}

export default function ChatPage() {
  const { language } = useLanguage();
  const lang = (language === "am" ? "am" : "en") as AppLanguage;
  const [chatItems, setChatItems] = React.useState<ChatItem[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentChatId, setCurrentChatIdState] = React.useState<string | null>(null);
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

  const setCurrentChatId = React.useCallback((id: string | null) => {
    setCurrentChatIdState(id);
    if (id) {
      localStorage.setItem(CURRENT_CHAT_ID_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_CHAT_ID_KEY);
    }
  }, []);

  const live = useGeminiLive(GEMINI_API_KEY, liveLanguage, liveVoice, {
    onTurnComplete: async (userText, modelText) => {
      const newMsgs: Message[] = [];
      if (userText) {
        newMsgs.push({ id: `live-user-${Date.now()}`, role: 'user', content: userText, timestamp: 'now' });
      }
      if (modelText) {
        newMsgs.push({ id: `live-model-${Date.now()}`, role: 'assistant', content: modelText, timestamp: 'now' });
      }
      if (newMsgs.length > 0) {
        setMessages(prev => [...prev, ...newMsgs]);
        if (newMsgs.length === 2) {
          const chatId = currentChatId || await ensureChatId();
          if (chatId) {
            for (const msg of newMsgs) {
              await saveMessage(chatId, msg.role, msg.content);
            }
            loadChats();
          }
        }
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
      setMessages(prev => [...prev, {
        id: `live-err-${Date.now()}`,
        role: 'assistant',
        content: `Voice error: ${error}`,
        timestamp: 'now',
      }]);
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
        setMessages(prev => [...prev, {
          id: `live-err-${Date.now()}`,
          role: 'assistant',
          content: 'Error: Gemini API key not set. Set NEXT_PUBLIC_GEMINI_API_KEY in your environment.',
          timestamp: 'now',
        }]);
        return;
      }
      live.startSession();
    }
  }, [isLive, live, GEMINI_API_KEY]);

  React.useEffect(() => {
    return () => { live.closeSession(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    loadChats();
  }, []);

  React.useEffect(() => {
    const savedId = localStorage.getItem(CURRENT_CHAT_ID_KEY);
    if (savedId) {
      setCurrentChatIdState(savedId);
      loadMessages(savedId);
    }
  }, []);

  function mapChatToItem(c: {
    id: string;
    title?: string;
    createdAt: string;
    messages?: { role: string; content: string }[];
  }): ChatItem {
    return {
      id: c.id,
      title: chatDisplayTitle(c),
      createdAt: c.createdAt,
      timestamp: formatTime(c.createdAt, lang),
      isActive: c.id === currentChatId,
      messages: c.messages,
    };
  }

  async function saveMessage(chatId: string, role: string, content: string) {
    try {
      return await chatApi.appendMessage(chatId, role, content);
    } catch (e) {
      console.error("Failed to save message", e);
      return null;
    }
  }

  async function ensureChatId(): Promise<string | null> {
    try {
      const json = await chatApi.createChat("New Chat");
      if (json.success && json.data) {
        const chat = json.data as { id: string; title?: string; createdAt: string; messages?: [] };
        setCurrentChatId(chat.id);
        setMessages([]);
        setChatItems((prev) => [
          mapChatToItem({ ...chat, messages: [] }),
          ...prev.map((c) => ({ ...c, isActive: false })),
        ]);
        return chat.id;
      }
    } catch (e) {
      console.error("Failed to create chat", e);
    }
    return null;
  }

  async function loadChats() {
    try {
      const json = await chatApi.getChats();
      if (json.success && Array.isArray(json.data)) {
        setChatItems(
          json.data.map((c: ChatItem & { createdAt: string; messages?: { role: string; content: string }[] }) =>
            mapChatToItem(c)
          )
        );
      }
    } catch (e) {
      console.error("Failed to load chats", e);
    }
  }

  async function loadMessages(chatId: string) {
    try {
      const json = await chatApi.getChat(chatId);
      if (json.success && json.data) {
        const data = json.data as { messages: { id: string; role: string; content: string; createdAt: string }[] };
        setMessages(
          data.messages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: formatTime(m.createdAt, lang),
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  }

  async function handleNewChat(): Promise<string | null> {
    try {
      const json = await chatApi.createChat("New Chat");
      if (json.success && json.data) {
        const chat = json.data as { id: string; title?: string; createdAt: string };
        setCurrentChatId(chat.id);
        setMessages([]);
        setChatItems((prev) => [
          mapChatToItem({ ...chat, messages: [] }),
          ...prev.map((c) => ({ ...c, isActive: false })),
        ]);
        return chat.id;
      }
    } catch (e) {
      console.error("Failed to create chat", e);
    }
    return null;
  }

  async function handleDeleteChat(id: string) {
    try {
      const json = await chatApi.deleteChat(id);
      if (json.success) {
        if (currentChatId === id) {
          setCurrentChatId(null);
          setMessages([]);
        }
        setChatItems((prev) => prev.filter((c) => c.id !== id));
        await loadChats();
      }
    } catch (e) {
      console.error("Failed to delete chat", e);
    }
  }

  async function handleSelectChat(id: string) {
    setCurrentChatId(id);
    setChatItems(prev => prev.map(c => ({ ...c, isActive: c.id === id })));
    await loadMessages(id);
  }

  async function handleSendMessage(content: string) {
    const chatId = currentChatId || await handleNewChat();
    if (!chatId) return;

    const userMsgId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: userMsgId, role: "user", content, timestamp: "now" }]);
    setIsLoading(true);

    try {
      const json = await chatApi.sendMessage(chatId, content, language);

      setIsLoading(false);

      if (json.success && json.data) {
        const data = json.data as { assistantMessage?: { content: string } };
        if (data.assistantMessage) {
          setChatItems((prev) =>
            prev.map((c) =>
              c.id === chatId && (c.title === "New Chat" || c.title === "Voice Chat")
                ? { ...c, title: chatDisplayTitle({ title: c.title, messages: [{ role: "user", content }] }) }
                : c
            )
          );
        }
        await loadMessages(chatId);
        await loadChats();
      } else {
        setMessages(prev =>
          prev.map(m =>
            m.id === userMsgId
              ? { ...m, content: "Sorry, I couldn't process that request. Please try again." }
              : m
          )
        );
        loadChats();
      }
    } catch (e) {
      setIsLoading(false);
      console.error("Chat error:", e);
      setMessages(prev =>
        prev.map(m =>
          m.id === userMsgId
            ? { ...m, content: "Sorry, I couldn't process that request. Please try again." }
            : m
        )
      );
      loadChats();
    }
  }

  return (
    <div className="max-w-325 w-full h-[90vh] max-h-200 bg-white flex overflow-hidden">
      <ChatHistory
        items={chatItems}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      <Chats
        currentChatTitle="Agri Chat"
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