import { ResourceBase } from '@/resource/core/resource-base';
import { Color } from './color';

export class Font extends ResourceBase<'font'> {
  private fontImages: Map<string, ImageBitmap> = new Map();

  getImageId = (char: string, color: Color) => `${this.data.id}.${char}.${color.toHexString}`;

  getImage = (char: string, color: Color) => {
    const id = this.getImageId(char, color);
    if (!this.fontImages.has(id)) this.registerImage(id, this.createImage(char, color));
    return id;
  };

  createImage = (char: string, color: Color): ImageBitmap => {
    const mask = this.data.chars[char];
    const buf = new Uint8Array(256); // 4*8*8
    let i = 0;
    for (const hex of mask) {
      const hexVal = parseInt(hex, 16);
      for (let shift = 0; shift < 4; shift++) {
        if (hexVal & (1 << shift)) {
          buf[i] = color.r;
          buf[i + 1] = color.g;
          buf[i + 2] = color.b;
          buf[i + 3] = color.a;
        }
      }
      i += 4;
    }
    return new ImageBitmap();
  };

  registerImage = (imageId: string, imageData: ImageBitmap) => {
    this.ctx.assets.renderer?.registerImage({ imageId, imageData });
  };

  resolveImages = (letter: string, color: Color): string[] => {
    const chars = this.data.compose[letter].map((composed) => this.data.chars[composed]) ?? [this.data.chars[letter]];
    return chars.map((char) => this.getImage(char, color));
  };
}
