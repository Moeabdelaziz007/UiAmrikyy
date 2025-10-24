// Audio Encoding & Decoding utilities for Gemini Live API

/**
 * Decodes a base64 encoded string into a Uint8Array.
 * The Gemini Live API returns audio as base64 encoded strings.
 * This function is necessary to convert it back to raw bytes for playback.
 * @param base64 The base64 encoded string.
 * @returns A Uint8Array containing the decoded bytes.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer for playback.
 * The browser's native `AudioContext.decodeAudioData` is for file formats like MP3/WAV,
 * not raw audio streams. This custom decoder is required to handle the raw PCM data
 * from the Gemini Live API.
 * @param data The raw audio data as a Uint8Array.
 * @param ctx The AudioContext to create the buffer in.
 * @param sampleRate The sample rate of the audio (e.g., 24000 for Gemini output).
 * @param numChannels The number of audio channels (typically 1).
 * @returns A promise that resolves to an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Encodes a Uint8Array of raw audio bytes into a base64 string.
 * This is used to send microphone audio data to the Gemini Live API.
 * @param bytes The Uint8Array of audio data.
 * @returns A base64 encoded string.
 */
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Singleton AudioContext for TTS playback
let audioContext: AudioContext | null = null;

/**
 * Plays a base64 encoded string of raw PCM audio data.
 * @param base64Audio The base64 encoded audio string.
 * @param sampleRate The sample rate of the audio (defaults to 24000 for Gemini TTS).
 */
export const playBase64Audio = async (base64Audio: string, sampleRate = 24000) => {
    if (!base64Audio) return;
    try {
        if (!audioContext || audioContext.state === 'closed') {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
        }
        const audioCtx = audioContext;
        // Ensure context is running (especially needed after user interaction)
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, sampleRate, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
    } catch (error) {
        console.error("Failed to play audio:", error);
    }
};