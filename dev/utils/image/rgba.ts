export function rgbaArrayToUint8(data: number[][]): Uint8Array {
  const out = new Uint8Array(data.length * 4);
  let i = 0;
  for (const [r, g, b, a] of data) {
    out[i++] = r;
    out[i++] = g;
    out[i++] = b;
    out[i++] = a;
  }
  return out;
}
