import yaml from 'yaml';
import { Size2d } from '@/types/engine';

const textEncoder = new TextEncoder();
const crcTable = Array.from({ length: 256 }, (_, i) => {
  let c = i;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint32(value: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value);
  return bytes;
}

function concatBytes(chunks: Uint8Array[]) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function makeChunk(type: string, data: Uint8Array) {
  const typeBytes = textEncoder.encode(type);
  return concatBytes([
    writeUint32(data.byteLength),
    typeBytes,
    data,
    writeUint32(crc32(concatBytes([typeBytes, data]))),
  ]);
}

function adler32(bytes: Uint8Array) {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function deflateStore(bytes: Uint8Array) {
  const chunks: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  for (let offset = 0; offset < bytes.byteLength; offset += 0xffff) {
    const block = bytes.subarray(offset, offset + 0xffff);
    const header = new Uint8Array(5);
    header[0] = offset + block.byteLength >= bytes.byteLength ? 1 : 0;
    header[1] = block.byteLength & 0xff;
    header[2] = block.byteLength >> 8;
    header[3] = ~block.byteLength & 0xff;
    header[4] = (~block.byteLength >> 8) & 0xff;
    chunks.push(header, block);
  }
  chunks.push(writeUint32(adler32(bytes)));
  return concatBytes(chunks);
}

function colorArrayToPng(size: Size2d, colorArray: number[][]) {
  const scanlines = new Uint8Array(size.height * (1 + size.width * 4));
  colorArray.forEach((color: number[], i: number) => {
    const [r, g, b, a] = color;
    const row = Math.floor(i / size.width);
    const col = i % size.width;
    const idx = row * (1 + size.width * 4) + 1 + col * 4;

    scanlines[idx] = r;
    scanlines[idx + 1] = g;
    scanlines[idx + 2] = b;
    scanlines[idx + 3] = a;
  });

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, size.width);
  ihdrView.setUint32(4, size.height);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return concatBytes([
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflateStore(scanlines)),
    makeChunk('IEND', new Uint8Array()),
  ]).buffer;
}

export function yamlToPng(yamlText: string) {
  const { size, palette, pixels } = yaml.parse(yamlText);

  const tokens = pixels.match(/[0-9a-zA-Z]{2}/g);
  if (!tokens) throw new Error('invalid pixels');

  const colorArray = tokens.map((token: string) => palette[token]);
  return colorArrayToPng(size, colorArray);
}

export function dt3ToPng(dt3Text: string) {
  const [sizeText, pixelsText, paletteText, transparentText] = dt3Text.split(':');

  const [height, width] = sizeText.split(',').map(Number);
  const transparent = Number(transparentText);

  const pixels = pixelsText.split(',').map(Number);
  const palette = paletteText
    .split(',')
    .map(Number)
    .map((colorInt, i) => [
      Math.floor(colorInt / 0x10000),
      Math.floor((colorInt % 0x10000) / 0x100),
      Math.floor(colorInt % 0x100),
      i === transparent ? 0 : 255,
    ]);

  const colorArray = pixels.map((pixel) => palette[pixel]);
  return colorArrayToPng({ height, width }, colorArray);
}
