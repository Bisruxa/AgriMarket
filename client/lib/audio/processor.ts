declare const sampleRate: number;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: any);
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
declare function registerProcessor(name: string, processorCtor: any): void;

const WORKLET_SAMPLE_RATE: number = sampleRate;

class MicProcessor extends AudioWorkletProcessor {
  private targetSampleRate: number;
  private chunkSize: number;
  private resampleRatio: number;
  private inputQueue: number[] = [];
  private resampleCursor = 0;
  private outChunk: number[] = [];

  constructor(options?: AudioWorkletNodeOptions & { processorOptions?: any }) {
    super();
    const { processorOptions } = options ?? {};
    this.targetSampleRate = (processorOptions?.targetSampleRate as number) || 16000;
    this.chunkSize = (processorOptions?.chunkSize as number) || 320;
    this.resampleRatio = WORKLET_SAMPLE_RATE / this.targetSampleRate;
  }

  private maybeEmit() {
    if (this.outChunk.length >= this.chunkSize) {
      const out = new Float32Array(this.outChunk.splice(0, this.chunkSize));
      this.port.postMessage(out);
    }
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs?.[0]?.[0];
    if (!input || input.length === 0) {
      return true;
    }

    for (let i = 0; i < input.length; i++) {
      this.inputQueue.push(input[i]);
    }

    const len = this.inputQueue.length;
    while (Math.floor(this.resampleCursor) + 1 < len) {
      const i0 = Math.floor(this.resampleCursor);
      const i1 = i0 + 1;
      const frac = this.resampleCursor - i0;
      const s0 = this.inputQueue[i0];
      const s1 = this.inputQueue[i1];
      const outSample = s0 + (s1 - s0) * frac;
      this.outChunk.push(outSample);
      this.resampleCursor += this.resampleRatio;
      this.maybeEmit();
    }

    const consumed = Math.max(0, Math.floor(this.resampleCursor) - 1);
    if (consumed > 0) {
      this.inputQueue.splice(0, consumed);
      this.resampleCursor -= consumed;
    }

    return true;
  }
}

registerProcessor('mic-processor', MicProcessor);
