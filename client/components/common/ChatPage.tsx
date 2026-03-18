"use client";

import * as React from "react";
import { ChatHistory } from "./ChatHistory";
import { Chats } from "./Chats";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export default function ChatPage() {
  const [chatItems, setChatItems] = React.useState([
    {
      id: "1",
      title: "Minimal Assistant",
      timestamp: "now",
      isActive: true,
    },
    {
      id: "2",
      title: "Garden project ideas",
      timestamp: "1h",
      isActive: false,
    },
    { id: "3", title: "Nature palette talk", timestamp: "3h", isActive: false },
    {
      id: "4",
      title: "Farmstead dashboard",
      timestamp: "yest",
      isActive: false,
    },
    {
      id: "5",
      title: "Organic farming notes",
      timestamp: "2d",
      isActive: false,
    },
    { id: "6", title: "Sustainability chat", timestamp: "3d", isActive: false },
    { id: "7", title: "Forest camping", timestamp: "5d", isActive: false },
    { id: "8", title: "Greenhouse setup", timestamp: "w2", isActive: false },
  ]);

  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your green assistant. Ask me anything about nature, design, or farming.",
      timestamp: "just now",
      suggestions: ["more green", "nature mode"],
    },
    {
      id: "2",
      role: "user",
      content: "i love this green color vibe you've created",
      timestamp: "1 min ago",
    },
    {
      id: "3",
      role: "assistant",
      content:
        "thanks! the palette uses soft sage, forest, and mint tones. everything feels fresh and organic.",
      timestamp: "now",
      suggestions: ["more green", "nature mode"],
    },
  ]);

  const handleNewChat = () => {
    console.log("New chat created");
  };

  const handleSelectChat = (id: string) => {
    setChatItems((prev) =>
      prev.map((item) => ({
        ...item,
        isActive: item.id === id,
      })),
    );
    console.log(`Loading chat ${id}`);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: "just now",
    };
    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "That's great! The green theme really brings a calming natural feel to the interface.",
        timestamp: "now",
        suggestions: ["tell me more", "show examples"],
      };
      setMessages((prev) => [...prev, assistantResponse]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const currentChatTitle =
    chatItems.find((item) => item.isActive)?.title || "Green Minimal Assistant";

  return (
    <div className="max-w-325 w-full h-[90vh] max-h-200 bg-white  flex overflow-hidden">
      <ChatHistory
        items={chatItems}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <Chats
        currentChatTitle={currentChatTitle}
        messages={messages}
        onSendMessage={handleSendMessage}
        // onSuggestionClick={handleSuggestionClick}
      />
    </div>
  );
}
