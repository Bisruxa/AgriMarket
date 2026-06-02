'use client';

/** Notion-style swirling AI orb for the sidebar chat entry */
export function AnimatedChatIcon({ size = 20 }: { size?: number }) {
  return (
    <span
      className="relative mr-2 inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full opacity-90 animate-[spin_3s_linear_infinite]"
        style={{
          background:
            'conic-gradient(from 0deg, #2A5A2A, #7cb342, #ffd54f, #42a5f5, #ab47bc, #2A5A2A)',
        }}
      />
      <span className="absolute inset-[2px] rounded-full bg-white" />
      <span className="absolute inset-[5px] rounded-full bg-gradient-to-br from-[#5B8C51]/30 to-[#2A5A2A]/10 animate-pulse" />
      <span
        className="absolute h-1 w-1 rounded-full bg-[#2A5A2A] animate-[ping_2s_ease-in-out_infinite]"
        style={{ top: '18%', right: '22%' }}
      />
      <span
        className="absolute h-0.5 w-0.5 rounded-full bg-amber-400 animate-[ping_2.5s_ease-in-out_infinite_0.4s]"
        style={{ bottom: '20%', left: '24%' }}
      />
    </span>
  );
}

export default AnimatedChatIcon;
