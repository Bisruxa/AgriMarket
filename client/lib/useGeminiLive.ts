'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { encode, decode, decodeAudioData } from './audioUtils';
import { Language, Voice } from '../types/real-time';
import type { LiveStatus } from '../types/real-time';

type LiveSession = any;
type LiveServerMessage = any;
type InlineDataBlob = { data: string; mimeType: string };

interface UseGeminiLiveCallbacks {
  onTurnComplete?: (userText: string, modelText: string) => void;
  onStatusChange?: (status: LiveStatus) => void;
  onError?: (error: string) => void;
}

const AGRICULTURE_INSTRUCTION: Record<Language, string> = {
  [Language.ENGLISH]:
    'You are AgriAI, a friendly and helpful agricultural assistant for Ethiopian farmers. ' +
    'Provide practical advice about crops, farming techniques, pest control, soil management, ' +
    'weather patterns, and market prices in Ethiopia. Respond conversationally in English. ' +
    'Keep responses concise and actionable.',
  [Language.AMHARIC]:
    'አንተ AgriAI ነህ፣ ለኢትዮጵያ ገበሬዎች ወዳጃዊ እና አጋዥ የእርሻ ረዳት ነህ። ' +
    'ስለ ሰብሎች፣ የእርሻ ዘዴዎች፣ የተባይ መከላከያ፣ የአፈር አያያዝ፣ ' +
    'የአየር ንብረት እና የገበያ ዋጋዎች በኢትዮጵያ ውስጥ ተግባራዊ ምክር ስጥ። ' +
    'በአማርኛ በውይይት መልክ መልስ ስጥ። መልሶችህን አጭር እና ተግባራዊ አድርግ።',
};

export function useGeminiLive(
  apiKey: string,
  language: Language,
  voice: Voice,
  callbacks?: UseGeminiLiveCallbacks,
) {
  const [status, setStatus] = useState<LiveStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isClosingRef = useRef<boolean>(false);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const getSystemInstruction = useCallback(() => {
    return AGRICULTURE_INSTRUCTION[language];
  }, [language]);

  const setStatusAndNotify = useCallback((s: LiveStatus) => {
    setStatus(s);
    callbacksRef.current?.onStatusChange?.(s);
  }, []);

  const closeSession = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    try {
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close()).catch(() => {});
        sessionPromiseRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      if (mediaSourceNodeRef.current) {
        try { mediaSourceNodeRef.current.disconnect(); } catch {}
        mediaSourceNodeRef.current = null;
      }

      if (workletNodeRef.current) {
        try { workletNodeRef.current.port.onmessage = null as any; } catch {}
        try { workletNodeRef.current.disconnect(); } catch {}
        workletNodeRef.current = null;
      }

      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close().catch(() => {});
      }
      inputAudioContextRef.current = null;

      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close().catch(() => {});
      }
      outputAudioContextRef.current = null;

      audioSourcesRef.current.forEach(source => {
        try { source.stop(); } catch {}
      });
      audioSourcesRef.current.clear();

      setIsListening(false);
      setStatusAndNotify('idle');
      setIsMuted(false);
      isMutedRef.current = false;
    } finally {
      isClosingRef.current = false;
    }
  }, [setStatusAndNotify]);

  const startSession = useCallback(async () => {
    if (isListening) return;

    setStatusAndNotify('connecting');
    setErrorMessage(null);

    try {
      const ai = new GoogleGenAI({ apiKey });

      const handleMessage = async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
          currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
        }

        if (message.serverContent?.inputTranscription) {
          currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
        }

        if (message.serverContent?.turnComplete) {
          const userInput = currentInputTranscriptionRef.current.trim();
          const geminiResponse = currentOutputTranscriptionRef.current.trim();

          currentInputTranscriptionRef.current = '';
          currentOutputTranscriptionRef.current = '';

          callbacksRef.current?.onTurnComplete?.(userInput, geminiResponse);
        }

        const parts = message.serverContent?.modelTurn?.parts;
        const base64Audio = Array.isArray(parts) ? parts[0]?.inlineData?.data : undefined;
        if (base64Audio && outputAudioContextRef.current) {
          const context = outputAudioContextRef.current;
          try {
            if (context.state === 'suspended') {
              await context.resume();
            }
          } catch (err) {
            console.warn('Failed to resume output audio context:', err);
          }

          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, context.currentTime);

          const audioBuffer = await decodeAudioData(decode(base64Audio), context, 24000, 1);
          const source = context.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(context.destination);

          source.addEventListener('ended', () => {
            audioSourcesRef.current.delete(source);
          });
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += audioBuffer.duration;
          audioSourcesRef.current.add(source);
        }
      };

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            setStatusAndNotify('connected');
            setIsListening(true);

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            let stream: MediaStream;
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
              });
            } catch (err: any) {
              throw new Error(`Microphone access denied or unavailable: ${err?.message ?? String(err)}`);
            }
            mediaStreamRef.current = stream;

            const inCtx = inputAudioContextRef.current;
            if (!inCtx) throw new Error('Failed to initialize input audio context.');

            try {
              await inCtx.audioWorklet.addModule('/audio-processor.js');
            } catch (err: any) {
              throw new Error(`Failed to load audio worklet: ${err?.message ?? String(err)}`);
            }

            const source = inCtx.createMediaStreamSource(stream);
            mediaSourceNodeRef.current = source;

            const workletNode = new AudioWorkletNode(inCtx, 'mic-processor', {
              numberOfInputs: 1,
              numberOfOutputs: 0,
              processorOptions: { targetSampleRate: 16000, chunkSize: 320 },
            });
            workletNodeRef.current = workletNode;

            workletNode.port.onmessage = (ev: MessageEvent) => {
              const float32 = ev.data as Float32Array;
              if (!float32 || float32.length === 0) return;
              if (isMutedRef.current) return;

              const int16 = new Int16Array(float32.length);
              for (let i = 0; i < float32.length; i++) {
                const s = Math.max(-1, Math.min(1, float32[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }
              const bytes = new Uint8Array(int16.buffer);
              const pcmBlob: InlineDataBlob = {
                data: encode(bytes),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob })).catch(() => {});
            };

            source.connect(workletNode);
          },
          onmessage: handleMessage,
          onerror: (e) => {
            console.error('Gemini Live error:', e);
            const msg = (e && (e as any).message)
              ? String((e as any).message)
              : 'An unknown error occurred with the voice session.';
            setErrorMessage(msg);
            setStatusAndNotify('error');
            callbacksRef.current?.onError?.(msg);
            closeSession();
          },
          onclose: () => {
            closeSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
          systemInstruction: getSystemInstruction(),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });
    } catch (error) {
      console.error('Failed to start Gemini Live session:', error);
      const msg = (error as any)?.message ?? 'Failed to start session.';
      setErrorMessage(msg);
      setStatusAndNotify('error');
      callbacksRef.current?.onError?.(msg);
      setIsListening(false);
    }
  }, [apiKey, isListening, closeSession, getSystemInstruction, voice, setStatusAndNotify]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      isMutedRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      closeSession();
    };
  }, [closeSession]);

  return { status, isListening, isMuted, errorMessage, startSession, closeSession, toggleMute };
}
