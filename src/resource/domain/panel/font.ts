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
    const mask = this.data.chars[char] ?? this.data.chars[' '];
    const buf = new Uint8Array(256); // 4*8*8
    let i = 0;
    for (const hex of mask) {
      const hexVal = parseInt(hex, 16);
      for (let shift = 0; shift < 4; shift++) {
        if (hexVal & (8 >> shift)) {
          buf[i] = color.r;
          buf[i + 1] = color.g;
          buf[i + 2] = color.b;
          buf[i + 3] = color.a;
        }
        i += 4;
      }
    }
    const canvas = new OffscreenCanvas(8, 8);
    const context = canvas.getContext('2d');
    context?.putImageData(new ImageData(new Uint8ClampedArray(buf), 8, 8), 0, 0);
    return canvas.transferToImageBitmap();
  };

  registerImage = (imageId: string, imageData: ImageBitmap) => {
    this.fontImages.set(imageId, imageData);
    this.ctx.assets.renderer?.registerImage({ imageId, imageData });
  };

  resolveImages = (letter: string, color: Color): string[] => {
    const composed = this.data.compose[letter];
    const chars = composed ?? [this.data.chars[letter] ? letter : ' '];
    return chars.map((char) => this.getImage(char, color));
  };
}
