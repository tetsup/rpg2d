export function byteToHexString(val: number) {
  return val.toString(16).padStart(2, '0');
}

export class Color {
  r: number;
  g: number;
  b: number;
  a: number;
  constructor(r: number, g: number, b: number, a: number = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  toUint8Array = () => new Uint8Array([this.r, this.g, this.b, this.a]);

  toHexString = () =>
    `#${byteToHexString(this.r)}${byteToHexString(this.g)}${byteToHexString(this.b)}${byteToHexString(this.a)}`;
}
