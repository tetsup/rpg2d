import type { Manifest } from '@/schemas/manifest';
import type { ResourceConfig } from '@/schemas/resource-config';
import { ResourceStore } from './resource-store';
import { AssetCache } from './asset-cache';
import { GameState } from './game-state';
import { SchemaRegistry } from './schema-registry';
import { ResourceFactory } from './resource-factory';
import type { PanelManager } from '@/engine/panel/panel-manager';

export class GameContext {
  assets: AssetCache;
  factory: ResourceFactory;
  resources: ResourceStore;
  state: GameState;
  schemas: SchemaRegistry;
  panels?: PanelManager;

  constructor(
    readonly manifest: Manifest,
    readonly config: ResourceConfig
  ) {
    this.assets = new AssetCache(config);
    this.factory = new ResourceFactory(this);
    this.resources = new ResourceStore(this);
    this.state = new GameState(manifest);
    this.schemas = new SchemaRegistry(manifest);
  }
}
