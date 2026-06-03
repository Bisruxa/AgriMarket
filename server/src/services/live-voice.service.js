const { GoogleGenAI } = require('@google/genai');
const { FUNCTION_DECLARATIONS, executeFunction } = require('./function-executor.service');

const LANGUAGE_INSTRUCTION = {
  en: 'You are AgriAI, a friendly and helpful agricultural assistant for Ethiopian farmers. ' +
      'You have access to tools that can get real data. When a user asks about ' +
      'crop recommendations, price forecasts, weather, or market data, use the appropriate tool. ' +
      'After getting tool results, explain them in a clear, conversational way. ' +
      'Format prices in ETB (Ethiopian Birr). Be concise and actionable.',
  am: 'አንተ AgriAI ነህ፣ ለኢትዮጵያ ገበሪዎች ወዳጃዊ እና አጋዥ የእርሻ ረዳት ነህ። ' +
      'ተግባራዊ ምክር ስጥ - ሰብሎችን ለመመከት እና የገበያ ዋጋዎችን ለማወቅ ተገቢ መሳሪያዎችን ተጠቀም። ' +
      'ውጤቶቹን ግልጽ በሆነ መልኩ አብራራ። ዋጋዎችን በETB (የኢትዮጵያ ብር) አቅርብ። ' +
      'መልሶችህን አጭር እና ተግባራዊ አድርግ።',
};

const MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';

class LiveVoiceSession {
  constructor({ apiKey, language = 'en', voice = 'Zephyr', userContext = null, callbacks = {} }) {
    if (!apiKey) throw new Error('Gemini API key is required');
    this.ai = new GoogleGenAI({ apiKey });
    this.language = language;
    this.voice = voice;
    this.userContext = userContext;
    this.callbacks = callbacks;
    this.session = null;
    this._closed = false;
    this._inputAccumulator = '';
    this._outputAccumulator = '';
  }

  async start() {
    const systemInstruction = this._buildSystemPrompt();

    this.session = await this.ai.live.connect({
      model: MODEL,
      callbacks: {
        onopen: () => {
          this.callbacks.onOpen?.();
        },
        onmessage: (msg) => this._handleMessage(msg),
        onerror: (err) => {
          const message = err?.message || 'Gemini Live session error';
          this.callbacks.onError?.(message);
        },
        onclose: () => {
          if (!this._closed) {
            this._closed = true;
            this.callbacks.onClose?.();
          }
        },
      },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: this.voice } },
        },
        systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
      },
    });
  }

  _buildSystemPrompt() {
    const base = LANGUAGE_INSTRUCTION[this.language] || LANGUAGE_INSTRUCTION.en;
    if (!this.userContext) return base;
    const { role, region, woreda, name, farms } = this.userContext;
    const details = [];
    if (name) details.push(`Farmer name: ${name}`);
    if (role) details.push(`Role: ${role}`);
    if (region) details.push(`Region: ${region}`);
    if (woreda) details.push(`Woreda: ${woreda}`);
    if (farms?.length) {
      const farmList = farms.map(f => `${f.name || 'Farm'} (${f.region || '?'}, ${f.size || '?'} ha)`).join('; ');
      details.push(`Farms: ${farmList}`);
    }
    if (details.length === 0) return base;
    return `${base}\n\nUser context:\n${details.join('\n')}`;
  }

  _handleMessage(msg) {
    if (msg.serverContent?.inputTranscription?.text) {
      this._inputAccumulator += msg.serverContent.inputTranscription.text;
      this.callbacks.onTranscript?.('user', this._inputAccumulator);
    }

    if (msg.serverContent?.outputTranscription?.text) {
      this._outputAccumulator += msg.serverContent.outputTranscription.text;
      this.callbacks.onTranscript?.('model', this._outputAccumulator);
    }

    const toolCalls = msg.serverContent?.toolCall;
    if (toolCalls && Array.isArray(toolCalls)) {
      this._handleToolCalls(toolCalls);
    }

    if (msg.serverContent?.modelTurn?.parts) {
      for (const part of msg.serverContent.modelTurn.parts) {
        if (part.inlineData?.mimeType?.startsWith('audio/')) {
          this.callbacks.onAudio?.(part.inlineData.data);
        }
      }
    }

    if (msg.serverContent?.turnComplete) {
      const userText = this._inputAccumulator;
      const modelText = this._outputAccumulator;
      this._inputAccumulator = '';
      this._outputAccumulator = '';
      this.callbacks.onTurnComplete?.(userText, modelText);
    }
  }

  async _handleToolCalls(toolCalls) {
    for (const toolCall of toolCalls) {
      const fn = toolCall.functionCalls?.[0];
      if (!fn) continue;
      this.callbacks.onToolCall?.(fn.name, fn.args);
      try {
        const result = await executeFunction(fn.name, fn.args);
        if (this.session && !this._closed) {
          this.session.sendToolResponse({
            functionResponses: [{
              id: toolCall.id || fn.name,
              name: fn.name,
              response: result.success ? { result: result.data ?? {} } : { error: result.error || 'Tool failed' },
            }],
          });
        }
      } catch (err) {
        if (this.session && !this._closed) {
          this.session.sendToolResponse({
            functionResponses: [{
              id: toolCall.id || fn.name,
              name: fn.name,
              response: { error: err.message },
            }],
          });
        }
      }
    }
  }

  sendAudio(base64Pcm16) {
    if (this.session && !this._closed) {
      this.session.sendRealtimeInput({
        media: {
          data: base64Pcm16,
          mimeType: 'audio/pcm;rate=16000',
        },
      });
    }
  }

  close() {
    this._closed = true;
    if (this.session) {
      try { this.session.close(); } catch {}
      this.session = null;
    }
  }
}

module.exports = { LiveVoiceSession };
