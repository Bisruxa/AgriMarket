"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/UserContext";
import { getDashboardHref } from "@/lib/dashboard";

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
  onDeleteChat?: (id: string) => void;
  className?: string;
}

export function ChatHistory({
  items,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  className,
}: ChatHistoryProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAm = language === "am";

  return (
    <div
      className={`w-70 bg-[#f6fbf8] border-r border-[#d4e8dd] flex flex-col p-6 ${className || ""}`}
    >
      <button
        type="button"
        onClick={() => router.push(getDashboardHref(user?.role))}
        className="mb-6 flex w-fit items-center gap-2 rounded-lg bg-[#e2f3e9] px-3 py-2 text-[#1c4a2e] transition-all hover:bg-[#d4efdf] group"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4 text-[#2f7e4c] transition-transform group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium">{isAm ? "ተመለስ" : "Back"}</span>
      </button>

      <button
        type="button"
        onClick={onNewChat}
        className="w-full px-4 py-3 rounded-full bg-white border border-[#c0decb] text-[#1c4a2e] font-medium text-sm hover:bg-[#e7f5ec] hover:border-[#8fc9a8] transition-all mb-8 shadow-sm"
      >
        {isAm ? "አዲስ ውይይት" : "New chat"}
      </button>

      <p className="mb-4 text-[#3d6b4e] text-xs font-medium uppercase tracking-wide">
        {isAm ? "ቅርብ" : "Recent"}
      </p>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-[#e2f0e8] scrollbar-thumb-[#9fc0ae]">
        <div className="flex flex-col gap-1">
          {items.length === 0 ? (
            <p className="px-2 py-3 text-sm text-[#569f73]">{isAm ? "እስካሁን ውይይት የለም" : "No chats yet"}</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`group flex items-center gap-1 rounded-xl border transition-all ${
                  item.isActive
                    ? "bg-[#d4efdf] border-[#96c9ae]"
                    : "border-transparent hover:bg-[#e2f3e9] hover:border-[#b7ddc8]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat?.(item.id)}
                  className={`min-w-0 flex-1 px-3 py-2.5 text-left text-sm transition-all ${
                    item.isActive
                      ? "text-[#0f4020] font-medium"
                      : "text-[#1e462b]"
                  }`}
                >
                  <span className="block truncate">{item.title}</span>
                  <span className="mt-0.5 block text-[0.7rem] text-[#569f73]">
                    {item.timestamp}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat?.(item.id);
                  }}
                  className="mr-2 shrink-0 rounded-lg p-1.5 text-[#569f73] opacity-70 transition-all hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
