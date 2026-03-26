"use client";
import * as React from "react";
import {
  Leaf,
  Search,
  User,
  Send,
  MoreVertical,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatsProps {
  currentChatTitle?: string;
  messages: Message[];
  onSendMessage?: (message: string) => void;
  className?: string;
}

export function Chats({
  currentChatTitle = "minimal design",
  messages,
  onSendMessage,
  className,
}: ChatsProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex-1 flex flex-col bg-white ${className || ""}`}>
      <div className="px-8 py-5 border-b border-[#e2f0e8] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1d4a2e] font-medium">
          <Leaf className="h-4 w-4 text-[#388e5c]" />
          <span>{currentChatTitle}</span>
        </div>
        <div className="flex items-center gap-3 text-[#5e9c78]">
          <Search className="h-4 w-4 cursor-default hover:text-[#1d5e36] transition-colors" />
          <User className="h-4 w-4 cursor-default hover:text-[#1d5e36] transition-colors" />
          <MoreVertical className="h-4 w-4 cursor-default hover:text-[#1d5e36] transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-track-[#eaf3ee] scrollbar-thumb-[#a3c7b4]">
        <div className="flex flex-col gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                message.role === "user"
                  ? "self-end flex-row-reverse"
                  : "self-start"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  message.role === "user"
                    ? "bg-[#d4efde] text-[#1f6a3d]"
                    : "bg-[#e2f3e9] text-[#2b7a4b]"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>

              <div className="flex flex-col">
                <div
                  className={`rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-[#dcf2e5] rounded-br-md"
                      : "bg-[#edf7f2] rounded-bl-md"
                  }`}
                >
                  <p className="text-sm text-[#1b4027] leading-relaxed">
                    {message.content}
                  </p>
                </div>
                <span className="text-[0.65rem] text-[#6ea584] mt-1 ml-1">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}

          <div className="flex gap-3 max-w-[80%] self-start">
            <div className="w-9 h-9 rounded-xl bg-[#e2f3e9] flex items-center justify-center text-[#2b7a4b]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-dashed border-[#b8dac8] bg-transparent p-4">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[#6fa786] rounded-full animate-pulse opacity-50"></span>
                <span className="w-2 h-2 bg-[#6fa786] rounded-full animate-pulse opacity-50 animation-delay-200"></span>
                <span className="w-2 h-2 bg-[#6fa786] rounded-full animate-pulse opacity-50 animation-delay-400"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pt-5 bg-white border-t border-[#e2f3e9]">
        <div className="flex items-center gap-2 rounded-full border border-[#cde5d8] bg-[#f3fbf7] pl-5 pr-3 focus-within:border-[#8cc2a6] focus-within:bg-white focus-within:shadow-md transition-all">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none py-4 text-sm text-[#1b4a2d] placeholder:text-[#7fb197] focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              inputValue.trim()
                ? "bg-[#1b5933] text-white hover:bg-[#247a44]" 
                : "bg-[#e2f3e9] text-[#7fb197] cursor-default"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}