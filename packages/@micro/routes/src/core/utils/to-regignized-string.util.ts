import type { RecognizedString } from 'uWebSockets.js';

const textEncoder = new TextEncoder();
export function toRecognizedString(str: string): RecognizedString {
  return textEncoder.encode(str);
}
