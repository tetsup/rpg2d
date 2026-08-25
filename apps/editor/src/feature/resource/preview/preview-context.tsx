import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';
import type { GameContextLike } from '@engine/resource/core/game-context';
import { AssetCache, type AssetCacheLike } from '@engine/resource/core/asset-cache';
import type { ResourceStoreLike } from '@engine/resource/core/resource-store';
import type { GameStateLike } from '@engine/resource/core/game-state';
import type { ResourceFactoryLike } from '@engine/resource/core/resource-factory';
import type { SchemaRegistryLike } from '@engine/resource/core/schema-registry';
import { SchemaRegistry } from '@engine/resource/core/schema-registry';
import { PreviewResourceFactory, PreviewResourceInstanceMap } from './preview-factory';
import { ResourceStoreAdapter } from './store-adopter';
import { DummyGameState } from './dummy-state';

export class PreviewContext implements GameContextLike<PreviewResourceInstanceMap> {
  readonly assets: AssetCacheLike;
  readonly factory: ResourceFactoryLike<PreviewResourceInstanceMap>;
  readonly resources: ResourceStoreLike<PreviewResourceInstanceMap>;
  readonly state: GameStateLike;
  readonly schemas: SchemaRegistryLike;

  constructor(
    readonly manifest: ManifestData,
    readonly config: ResourceConfig
  ) {
    this.factory = new PreviewResourceFactory(this);
    this.resources = new ResourceStoreAdapter(this.factory);
    this.assets = new AssetCache(this.resources);
    this.schemas = new SchemaRegistry(this.manifest);
    this.state = new DummyGameState();
  }
}
