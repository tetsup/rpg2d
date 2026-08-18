import type { ActionData } from '@sharedTypes/resource/action';

export function buildActionData(data: Partial<ActionData> = {}): ActionData {
  return { sequence: data.sequence ?? [], ...data };
}
