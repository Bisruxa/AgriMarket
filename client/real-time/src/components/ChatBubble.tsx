import React from 'react';

interface ChatBubbleProps {
  sender: 'user' | 'gemini';
  text: string;
  isPartial?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ sender, text, isPartial }) => {
  const isUser = sender === 'user';

  return (
    <div
      className={`flex items-end gap-2 animate-fade-in-up ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-white rounded-bl-none'
        } ${isPartial ? 'opacity-80 italic' : ''}`}
        // Allow assistant messages to stretch wider horizontally up to 80ch, but never overflow the container
        style={isUser ? { whiteSpace: 'pre-wrap', maxWidth: 'min(60ch, 100%)' } : { whiteSpace: 'pre-wrap', maxWidth: 'min(80ch, 100%)' }}
      >
        <p>{text}{isPartial ? ' ▮' : ''}</p>
      </div>
    </div>
  );
};

// Add keyframes for animation in a style tag since Tailwind doesn't support them directly in JIT
const AnimationStyles = () => (
    <style>{`
        @keyframes fade-in-up {
            0% {
                opacity: 0;
                transform: translateY(10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
        }
    `}</style>
)

// Wrapper to include styles once
const ChatBubbleWithAnimation = (props: ChatBubbleProps) => (
    <>
        <AnimationStyles />
        <ChatBubble {...props} />
    </>
)


export default ChatBubbleWithAnimation;