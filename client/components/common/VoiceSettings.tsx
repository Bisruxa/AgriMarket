'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Voice, VOICE_LABELS } from '@/types/real-time';

interface VoiceSettingsProps {
  voice: Voice;
  onVoiceChange: (voice: Voice) => void;
  disabled?: boolean;
}

export function VoiceSettings({ voice, onVoiceChange, disabled }: VoiceSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        disabled={disabled}
        className="px-2.5 py-1.5 text-xs font-medium bg-[#e2f3e9] text-[#1b5933] hover:bg-[#d4efde] disabled:opacity-50 rounded-lg transition-colors"
      >
        {VOICE_LABELS[voice]}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-40 bg-white border border-[#cde5d8] rounded-lg shadow-lg p-2 z-10">
          <p className="text-[0.65rem] text-[#6ea584] px-2 pb-1.5">Assistant Voice</p>
          <button
            onClick={() => { onVoiceChange('Zephyr'); setIsOpen(false); }}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs ${
              voice === 'Zephyr' ? 'bg-[#dcf2e5] text-[#1b5933] font-medium' : 'text-[#5e9c78] hover:bg-[#edf7f2]'
            }`}
          >
            Jerry (Female)
          </button>
          <button
            onClick={() => { onVoiceChange('Orus'); setIsOpen(false); }}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs ${
              voice === 'Orus' ? 'bg-[#dcf2e5] text-[#1b5933] font-medium' : 'text-[#5e9c78] hover:bg-[#edf7f2]'
            }`}
          >
            Tom (Male)
          </button>
        </div>
      )}
    </div>
  );
}
