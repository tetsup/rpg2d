import type { FontData } from '@sharedTypes/resource/font';

export function buildFontData(data: Partial<FontData> = {}): FontData {
  return { format: 'simple', glyphWidth: 8, glyphHeight: 8, chars: {}, compose: {}, ...data };
}
