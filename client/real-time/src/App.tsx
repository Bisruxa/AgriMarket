import React, { useState, useEffect, useRef } from 'react';
import { Language } from './types';
import { UI_TEXTS } from './constants';
import { useGeminiLive } from './hooks/useGeminiLive';
import ChatBubble from './components/ChatBubble';
import LanguageSwitcher from './components/LanguageSwitcher';
import ControlButton from './components/ControlButton';
import VoiceSettings from './components/VoiceSettings';
import { MicrophoneIcon, StopIcon, TrashIcon, MicrophoneOffIcon } from './components/icons/Icons';

type Voice = 'Orus' | 'Zephyr';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [voice, setVoice] = useState<Voice>(() => {
    return (localStorage.getItem('gemini-voice') as Voice) || 'Zephyr';
  });

  const {
    messages,
    connectionState,
    isListening,
    isMuted,
    startSession,
    closeSession,
    clearMessages,
    errorMessage,
    toggleMute,
  } = useGeminiLive(language, voice);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('gemini-voice', voice);
  }, [voice]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMicClick = () => {
    if (!isListening) {
      startSession();
    } else {
      toggleMute();
    }
  };

  const handleClearClick = () => {
    if (isListening) {
      closeSession();
    }
    clearMessages();
  };

  const getStatusText = () => {
    if (connectionState === 'connecting') return UI_TEXTS[language].statusConnecting;
    if (connectionState === 'error') return errorMessage ?? UI_TEXTS[language].statusError;
    if (isListening && !isMuted) return UI_TEXTS[language].statusListening;
    if (isListening && isMuted) return UI_TEXTS[language].statusMuted;
    return UI_TEXTS[language].statusIdle;
  };
  
  return (
  <div className="bg-gradient-to-b from-black via-black-900 to-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-4">
  <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-full max-h-[90vh] bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
        <header className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl font-bold">{UI_TEXTS[language].header}</h1>
          <LanguageSwitcher language={language} setLanguage={setLanguage} disabled={isListening} />
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="text-3xl font-bold tracking-tight">{UI_TEXTS[language].welcomeTitle}</h2>
              <p className="text-gray-300 mt-2 max-w-md">{UI_TEXTS[language].welcomeSubtitle}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} sender={msg.sender} text={msg.text} isPartial={msg.isPartial} />
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </main>
        
        <footer className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
                {/* Left side: Voice Settings */}
                <div className="flex-1 flex justify-start">
                    <VoiceSettings 
                      onVoiceChange={setVoice} 
                      currentVoice={voice} 
                      disabled={isListening} 
                    />
                </div>

        {/* Center: Main Controls (status displayed next to mic) */}
  <div className="flex-1 flex justify-center items-center space-x-4 ml-14 md:ml-9">
          <ControlButton
            onClick={handleClearClick}
            disabled={messages.length === 0 && !isListening}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 w-12 h-12 text-2xl"
            aria-label={UI_TEXTS[language].clearChat}
          >
            <TrashIcon />
          </ControlButton>

          <ControlButton
            onClick={handleMicClick}
            className={`${isListening && !isMuted ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'} w-12 h-12 text-3xl`}
            aria-label={isListening ? (isMuted ? UI_TEXTS[language].unmute : UI_TEXTS[language].mute) : UI_TEXTS[language].startListening}
          >
            {isListening ? (isMuted ? <MicrophoneOffIcon /> : <StopIcon />) : <MicrophoneIcon />}
          </ControlButton>

          {/* Status text placed very close to the mic */}
          <div className="ml-2 flex items-center">
            <p className={`text-sm leading-none ${connectionState === 'error' ? 'text-red-400' : 'text-gray-300'}`}>{getStatusText()}</p>
          </div>
        </div>

        {/* Right spacer to perfectly center the controls */}
        <div className="flex-1" />
            </div>
        </footer>
      </div>
    {/* Left-bottom author note */}
    <div className="fixed bottom-2 text-sm text-gray-400">
      By: Kaletsidik A.  |  All rights reserved!
    </div>
    </div>
  );
};

export default App;