"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  FolderOpen,
  Leaf,
  Ellipsis,
  History,
  ArrowLeft,
} from "lucide-react";

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  isActive?: boolean;
}

interface ChatHistoryProps {
  items: ChatHistoryItem[];
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  className?: string;
}

export function ChatHistory({
  items,
  onNewChat,
  onSelectChat,
  className,
}: ChatHistoryProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div
      className={`w-70 bg-[#f6fbf8] border-r border-[#d4e8dd] flex flex-col p-6 ${className || ""}`}
    >
      <button
        onClick={handleGoBack}
        className="w-fit flex items-center -mt-3 gap-2 px-3 py-2 mb-8 rounded-lg text-[#1c4a2e] bg-[#e2f3e9] transition-all group"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4 text-[#2f7e4c] group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <button
        onClick={onNewChat}
        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-full bg-white border border-[#c0decb] text-[#1c4a2e] font-medium text-sm hover:bg-[#e7f5ec] hover:border-[#8fc9a8] transition-all mb-8 shadow-sm"
      >
        <Plus className="h-4 w-4 text-[#2f7e4c]" />
        <span>New chat</span>
      </button>

      <div className="flex justify-between items-center mb-4 text-[#3d6b4e] text-xs font-medium uppercase tracking-wide">
        <span className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5" />
          Recent
        </span>
        <Ellipsis className="h-3.5 w-3.5 text-[#5d8f72]" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-[#e2f0e8] scrollbar-thumb-[#9fc0ae]">
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectChat?.(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all border ${
                item.isActive
                  ? "bg-[#d4efdf] border-[#96c9ae] text-[#0f4020] font-medium"
                  : "bg-transparent border-transparent text-[#1e462b] hover:bg-[#e2f3e9] hover:border-[#b7ddc8]"
              }`}
            >
              <MessageSquare
                className={`h-3.5 w-3.5 ${item.isActive ? "text-[#2b7a4b]" : "text-[#46875d]"}`}
              />
              <span className="flex-1 text-left truncate">{item.title}</span>
              <span className="text-[0.7rem] text-[#569f73]">
                {item.timestamp}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#cde0d6] flex justify-between text-xs text-[#56926b]">
        <span className="flex items-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5" />
          all chats
        </span>
        <Leaf className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}