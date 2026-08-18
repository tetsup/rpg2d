import type { FieldData } from '@sharedTypes/resource/field';

export function buildFieldData(data: Partial<FieldData> = {}): FieldData {
  return { name: '', tiles: {}, map: [], ...data };
}
