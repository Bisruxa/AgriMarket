type LiveMessageHandler = (text: string, audioChunk?: string) => void;
type LiveStatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error', msg?: string) => void;

interface LiveChatOptions {
  onMessage: LiveMessageHandler;
  onStatus: LiveStatusHandler;
}

const SAMPLE_RATE = 16000;
const GEMINI_OUTPUT_RATE = 24000;

export function createLiveChat(token: string, options: LiveChatOptions) {
  const { onMessage, onStatus } = options;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
  const wsUrl = baseUrl.replace('http', 'ws');
  let ws: WebSocket | null = null;
  let audioContext: AudioContext | null = null;
  let mediaStream: MediaStream | null = null;
  let processor: ScriptProcessorNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let outputContext: AudioContext | null = null;

  function connect() {
    onStatus('connecting');
    ws = new WebSocket(`${wsUrl}/live?token=${encodeURIComponent(token)}`);

    ws.onopen = () => {
      ws!.send(JSON.stringify({ type: 'connect_live', config: {} }));
      onStatus('connected');
    };

    ws.onmessage = (event) => {
      const raw = typeof event.data === 'string' ? event.data : '';
      let msg: any;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      if (msg.type === 'error') {
        onStatus('error', msg.message);
        return;
      }

      if (Array.isArray(msg)) {
        const [type, payload] = msg;
        if (type === 'setupComplete') {
          return;
        }
        if (type === 'serverContent') {
          handleServerContent(payload);
          return;
        }
        if (type === 'toolCall') {
          handleToolCall(payload);
          return;
        }
      }
    };

    ws.onerror = () => {
      onStatus('error', 'WebSocket connection error');
    };

    ws.onclose = () => {
      onStatus('disconnected');
      stopCapture();
    };
  }

  function handleServerContent(payload: any) {
    const parts = payload?.model_turn?.parts || [];
    let text = '';
    let audioBase64: string | undefined;

    for (const part of parts) {
      if (part.text) {
        text += part.text;
      }
      if (part.inline_data?.data && part.inline_data?.mime_type?.startsWith('audio/')) {
        audioBase64 = part.inline_data.data;
      }
    }

    if (audioBase64) {
      playAudio(audioBase64);
    }

    if (text || audioBase64) {
      onMessage(text, audioBase64);
    }

    if (payload?.turn_complete) {
    }
  }

  function handleToolCall(payload: any) {
    ws?.send(JSON.stringify(['toolResponse', { id: payload.id, response: { result: 'ok' } }]));
  }

  function playAudio(base64Data: string) {
    try {
      if (!outputContext) {
        outputContext = new AudioContext({ sampleRate: GEMINI_OUTPUT_RATE });
      }
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const pcmData = new Int16Array(bytes.buffer);
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768;
      }
      const buffer = outputContext.createBuffer(1, floatData.length, GEMINI_OUTPUT_RATE);
      buffer.getChannelData(0).set(floatData);
      const sourceNode = outputContext.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.connect(outputContext.destination);
      sourceNode.start();
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  }

  async function startCapture() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      source = audioContext.createMediaStreamSource(mediaStream);
      processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (event) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const input = event.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          pcm16[i] = s < 0 ? s * 32768 : s * 32767;
        }
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const msg = JSON.stringify([
          'realtimeInput',
          {
            media_chunks: [
              { data: base64, mime_type: 'audio/pcm;rate=16000' },
            ],
          },
        ]);
        ws.send(msg);
      };
    } catch (e: any) {
      onStatus('error', `Microphone error: ${e.message}`);
    }
  }

  function stopCapture() {
    if (processor && source) {
      processor.disconnect();
      source.disconnect();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    if (outputContext) {
      outputContext.close();
    }
    processor = null;
    source = null;
    mediaStream = null;
    audioContext = null;
    outputContext = null;
  }

  function sendText(text: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify([
          'realtimeInput',
          { media_chunks: [{ data: btoa(text), mime_type: 'text/plain' }] },
        ])
      );
    }
  }

  function disconnect() {
    stopCapture();
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  return { connect, startCapture, stopCapture, sendText, disconnect };
}
