import type { ResourceId } from '@/schemas/common';
import type { Manifest } from '@/schemas/manifest';
import type { VariableState } from '@/types/engine';

export class GameState {
  variables: Map<ResourceId, VariableState>;

  constructor(manifest: Manifest) {
    this.variables = new Map();
    Object.entries(manifest.initialState.core.variables).forEach(([key, value]) => {
      this.variables.set(key, value);
    });
  }
}
