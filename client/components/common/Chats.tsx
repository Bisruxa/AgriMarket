"use client";
import * as React from "react";
import { User, Send, Sparkles, Mic, MicOff, Radio } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { VoiceSettings } from "./VoiceSettings";
import { Language, Voice } from "@/types/real-time";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatsProps {
  currentChatTitle?: string;
  messages: Message[];
  isAiTyping?: boolean;
  onSendMessage?: (message: string) => void;
  isLive?: boolean;
  liveStatus?: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  onToggleLive?: () => void;
  liveLanguage?: Language;
  onLiveLanguageChange?: (lang: Language) => void;
  liveVoice?: Voice;
  onLiveVoiceChange?: (voice: Voice) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  className?: string;
}

export function Chats({
  currentChatTitle = "Agri Chat",
  messages,
  isAiTyping = false,
  onSendMessage,
  isLive = false,
  liveStatus = 'idle',
  onToggleLive,
  liveLanguage = Language.ENGLISH,
  onLiveLanguageChange,
  liveVoice = 'Zephyr',
  onLiveVoiceChange,
  isMuted = false,
  onToggleMute,
  className,
}: ChatsProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    setIsSpeechSupported(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    );
  }, []);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = React.useCallback(() => {
    if (!isSpeechSupported || isListening) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (onSendMessage && transcript.trim()) {
        onSendMessage(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSpeechSupported, isListening, onSendMessage]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  React.useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

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

  const hasText = inputValue.trim().length > 0;

  const getLiveStatusText = () => {
    if (liveStatus === 'connecting') return 'Connecting...';
    if (isMuted) return 'Muted';
    return 'Listening...';
  };

  return (
    <div className={`flex-1 flex flex-col bg-white ${className || ""}`}>
      <div className="px-8 py-5 border-b border-[#e2f0e8]">
        <h1 className="text-[#1d4a2e] font-medium truncate">
          {currentChatTitle}
          {isLive && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-normal align-middle animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              LIVE
            </span>
          )}
        </h1>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-6">
          {messages.length === 0 && !isAiTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#6ea584] mt-16">
              <Sparkles className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-[#1d4a2e]">
                How Can I Help You Today
              </h3>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 max-w-[80%] ${
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
                  <p className="text-sm text-[#1b4027] leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                <span className="text-[0.65rem] text-[#6ea584] mt-1 ml-1">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isAiTyping && (
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
          )}
        </div>
      </div>

      <div className="px-8 pt-5 bg-white border-t border-[#e2f3e9]">
        <div className={`flex items-center gap-2 rounded-full border bg-[#f3fbf7] pl-5 pr-3 transition-colors ${
          isListening
            ? "border-red-300 ring-1 ring-red-200"
            : isLive
            ? "border-[#5e9c78] ring-1 ring-[#cde5d8]"
            : "border-[#cde5d8] focus-within:border-[#8cc2a6]"
        }`}>
          {isLive ? (
            <>
              <LanguageSwitcher
                language={liveLanguage}
                setLanguage={onLiveLanguageChange || (() => {})}
                disabled={false}
              />
              <VoiceSettings
                voice={liveVoice}
                onVoiceChange={onLiveVoiceChange || (() => {})}
                disabled={false}
              />
              <div className="flex-1 flex items-center gap-2 py-3">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  liveStatus === 'connecting' ? 'bg-yellow-400' : isMuted ? 'bg-gray-400' : 'bg-green-500 animate-pulse'
                }`} />
                <span className={`text-xs ${
                  liveStatus === 'connecting' ? 'text-yellow-600' : isMuted ? 'text-gray-500' : 'text-green-700'
                }`}>
                  {getLiveStatusText()}
                </span>
              </div>
              <button
                onClick={onToggleMute}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    : 'bg-[#e8f4ef] text-[#5e9c78] hover:bg-[#d4efde]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                onClick={onToggleLive}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-all animate-pulse"
                title="Stop live session"
              >
                <Radio className="h-4 w-4" />
              </button>
            </>
          ) : isListening ? (
            <div className="flex-1 flex items-center gap-2 py-4 text-sm text-[#1b4027]">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 font-medium">Listening...</span>
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about crops, prices, weather..."
              className="flex-1 bg-transparent border-none py-4 text-sm outline-none text-[#1b4027] placeholder-[#8cb99e]"
            />
          )}
          {!isLive && !isListening && (
            hasText ? (
              <button
                onClick={handleSend}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1b5933] text-white hover:bg-[#247a44] transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                {onToggleLive && (
                  <button
                    onClick={onToggleLive}
                    disabled={liveStatus === 'connecting'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      liveStatus === 'connecting'
                        ? 'bg-yellow-100 text-yellow-600 cursor-wait'
                        : 'bg-[#e8f4ef] text-[#5e9c78] hover:bg-[#d4efde]'
                    }`}
                    title="Live voice conversation"
                  >
                    <Radio className="h-4 w-4" />
                  </button>
                )}
                {isSpeechSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-[#e2f3e9] text-[#5e9c78] hover:bg-[#d4efde]"
                    }`}
                    title={isListening ? "Stop listening" : "Voice input"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
