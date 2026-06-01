// AudioWorkletProcessor JS build for mic downsampling and chunking
// This file is intentionally plain JS so it can be loaded directly from production hosts.

class MicProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const processorOptions = (options && options.processorOptions) || (options && options.processorOptions) || {};
    this.targetSampleRate = processorOptions.targetSampleRate || 16000;
    this.chunkSize = processorOptions.chunkSize || 320;
    this.WORKLET_SAMPLE_RATE = sampleRate;
    this.resampleRatio = this.WORKLET_SAMPLE_RATE / this.targetSampleRate;
    this.inputQueue = [];
    this.resampleCursor = 0;
    this.outChunk = [];
  }

  maybeEmit() {
    if (this.outChunk.length >= this.chunkSize) {
      const out = new Float32Array(this.outChunk.splice(0, this.chunkSize));
      this.port.postMessage(out);
    }
  }

  process(inputs) {
    const input = inputs && inputs[0] && inputs[0][0];
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
