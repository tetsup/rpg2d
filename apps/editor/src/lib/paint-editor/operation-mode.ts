export const operationModes = ['pan', 'paint', 'rectFill', 'select', 'paste'] as const;

export type OperationMode = (typeof operationModes)[number];

export function isPaintMode(mode: OperationMode): boolean {
  return mode === 'paint' || mode === 'rectFill' || mode === 'paste';
}
