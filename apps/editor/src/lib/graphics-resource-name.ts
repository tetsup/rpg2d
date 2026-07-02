import type { GraphicsResourceType } from '@editor/lib/resource-type-meta';

/**
 * Generates a unique resource name without user input.
 * Pattern: `{type}.{base36-timestamp}{seq}.v0` (matches fixture naming like `hero.down1.v0`).
 */
let nameSequence = 0;

export function generateGraphicsResourceName(type: GraphicsResourceType): string {
  nameSequence += 1;
  const token = `${Date.now().toString(36)}${nameSequence.toString(36)}`;
  return `${type}.${token}.v0`;
}
