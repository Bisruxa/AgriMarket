import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { Language } from '../types';
import type { Message } from '../types';

// Local fallbacks for SDK types to avoid tight coupling to package typings
type LiveSession = any;
type LiveServerMessage = any;
type InlineDataBlob = { data: string; mimeType: string };

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

type Voice = 'Orus' | 'Zephyr';

export const useGeminiLive = (language: Language, voice: Voice) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
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

  const getSystemInstruction = useCallback(() => {
    if (language === Language.AMHARIC) {
      return 'You are a friendly and helpful assistant. Please respond in Amharic.';
    }
    return 'You are a friendly and helpful assistant. Please respond in English.';
  }, [language]);

  // Helper to add or update a live (partial) message at the end of the messages list
  const upsertPartialMessage = useCallback((id: string, sender: 'user' | 'gemini', text: string) => {
    setMessages(prev => {
      // Remove any existing partial with same id
      const filtered = prev.filter(m => m.id !== id);
      // Push the updated partial at the end
      return [...filtered, { id, sender, text, isPartial: true }];
    });
  }, []);

  const removePartialMessages = useCallback(() => {
    setMessages(prev => prev.filter(m => !(m.id === 'live-user' || m.id === 'live-gemini')));
  }, []);

  const closeSession = useCallback(() => {
    if (isClosingRef.current) return; // idempotent
    isClosingRef.current = true;

    try {
      // Close server session
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close()).catch(() => {});
        sessionPromiseRef.current = null;
      }

      // Stop mic tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      // Disconnect audio graph
      if (mediaSourceNodeRef.current) {
        try { mediaSourceNodeRef.current.disconnect(); } catch {}
        mediaSourceNodeRef.current = null;
      }

      if (workletNodeRef.current) {
        try { workletNodeRef.current.port.onmessage = null as any; } catch {}
        try { workletNodeRef.current.disconnect(); } catch {}
        workletNodeRef.current = null;
      }

      // Close contexts
      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close().catch(() => {});
      }
      inputAudioContextRef.current = null;

      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close().catch(() => {});
      }
      outputAudioContextRef.current = null;

      // Stop any scheduled outputs
      audioSourcesRef.current.forEach(source => {
        try { source.stop(); } catch {}
      });
      audioSourcesRef.current.clear();

      setIsListening(false);
      setConnectionState('idle');
      setIsMuted(false);
      isMutedRef.current = false;
    } finally {
      isClosingRef.current = false;
    }
  }, []);

  const startSession = useCallback(async () => {
    if (isListening) return;

    setConnectionState('connecting');
    clearMessages();
    setErrorMessage(null);
    
    try {
      // Use Vite env variable for API key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) {
        throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env.local file.');
      }
      const ai = new GoogleGenAI({ apiKey });

      const handleMessage = async (message: LiveServerMessage) => {
        // Handle incremental transcriptions (live partials)
        if (message.serverContent?.outputTranscription) {
          currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
          // upsert live AI partial
          upsertPartialMessage('live-gemini', 'gemini', currentOutputTranscriptionRef.current);
        }

        if (message.serverContent?.inputTranscription) {
          currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
          // upsert live user partial
          upsertPartialMessage('live-user', 'user', currentInputTranscriptionRef.current);
        }

        // When a turn completes, remove partials and append finalized messages
        if (message.serverContent?.turnComplete) {
          const userInput = currentInputTranscriptionRef.current.trim();
          const geminiResponse = currentOutputTranscriptionRef.current.trim();

          // Remove any live partials from the list before finalizing
          removePartialMessages();

          setMessages(prev => {
            const newMessages: Message[] = [...prev];
            if (userInput) newMessages.push({ id: `user-${Date.now()}`, sender: 'user', text: userInput });
            if (geminiResponse) newMessages.push({ id: `gemini-${Date.now()}`, sender: 'gemini', text: geminiResponse });
            return newMessages;
          });

          currentInputTranscriptionRef.current = '';
          currentOutputTranscriptionRef.current = '';
        }

  const parts = message.serverContent?.modelTurn?.parts;
  const base64Audio = Array.isArray(parts) ? parts[0]?.inlineData?.data : undefined;
        if (base64Audio && outputAudioContextRef.current) {
          const context = outputAudioContextRef.current;
          try {
            // Some browsers suspend AudioContext until a user gesture; ensure it's running
            if (context.state === 'suspended') {
              await context.resume();
            }
          } catch (err) {
            console.warn('Failed to resume output audio context:', err);
          }

          // Debug: log that we received audio payload
          console.debug('Received audio part, length:', base64Audio.length);

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
            setConnectionState('connected');
            setIsListening(true);
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            let stream: MediaStream;
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
            } catch (err: any) {
              throw new Error(`Microphone access denied or unavailable: ${err?.message ?? String(err)}`);
            }
            mediaStreamRef.current = stream;

            const inCtx = inputAudioContextRef.current;
            if (!inCtx) throw new Error('Failed to initialize input audio context.');

            // Load and create worklet
            // Try loading the module via the bundler (new URL) first; if that fails in production
            // (CSP, missing TS -> JS mapping), fall back to the static asset in /public.
            try {
              try {
                await inCtx.audioWorklet.addModule(new URL('../audio/processor.ts', import.meta.url));
              } catch (e) {
                // Fallback to public asset (prebuilt JS)
                console.warn('Bundled worklet load failed, falling back to public/audio-processor.js', e);
                await inCtx.audioWorklet.addModule('/audio-processor.js');
              }
            } catch (err: any) {
              throw new Error(`Failed to load audio worklet: ${err?.message ?? String(err)}`);
            }

            const source = inCtx.createMediaStreamSource(stream);
            mediaSourceNodeRef.current = source;

            const workletNode = new AudioWorkletNode(inCtx, 'mic-processor', {
              numberOfInputs: 1,
              numberOfOutputs: 0, // processing only, no audio output
              processorOptions: { targetSampleRate: 16000, chunkSize: 320 }, // 20ms @16kHz
            });
            workletNodeRef.current = workletNode;

            // Forward chunks to server as PCM16 base64 unless muted.
            workletNode.port.onmessage = (ev: MessageEvent) => {
              const float32 = ev.data as Float32Array;
              if (!float32 || float32.length === 0) return;
              // Check the current muted state via ref so runtime toggles take effect
              if (isMutedRef.current) return;
              // Convert Float32 [-1,1] to Int16 PCM
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

            // Wire the graph (source -> worklet). No destination since numberOfOutputs=0
            source.connect(workletNode);
          },
          onmessage: handleMessage,
          onerror: (e) => {
            console.error('Kalkie-talkie API Error:', e);
            const msg = (e && (e as any).message) ? String((e as any).message) : 'An unknown error occurred with the Kalkie-talkie session.';
            setErrorMessage(msg);
            setConnectionState('error');
            closeSession();
          },
          onclose: () => {
            closeSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          systemInstruction: getSystemInstruction(),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });

    } catch (error) {
  console.error('Failed to start Kalkie-talkie session:', error);
      setErrorMessage((error as any)?.message ?? 'Failed to start session.');
      setConnectionState('error');
      setIsListening(false);
    }
  }, [isListening, closeSession, getSystemInstruction, isMuted, voice]);
  
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      isMutedRef.current = next;
      return next;
    });
  }, []);
  
  const clearMessages = () => {
      setMessages([]);
      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      closeSession();
    };
  }, [closeSession]);

  return { messages, connectionState, isListening, isMuted, startSession, closeSession, clearMessages, errorMessage, toggleMute };
};