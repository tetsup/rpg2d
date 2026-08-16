import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';
import type { ExecutableResourceType, ResourceId } from '@sharedTypes/resource/common';
import type { ResourceClass } from '@engine/types/resource';

import type { GameContextLike } from '@engine/resource/core/game-context';
import type { AssetCacheLike } from '@engine/resource/core/asset-cache';
import type { ResourceStoreLike } from '@engine/resource/core/resource-store';
import type { GameStateLike } from '@engine/resource/core/game-state';
import type { ResourceFactoryLike } from '@engine/resource/core/resource-factory';
import { ResourceFactory } from '@engine/resource/core/resource-factory';
import type { SchemaRegistryLike } from '@engine/resource/core/schema-registry';
import { SchemaRegistry } from '@engine/resource/core/schema-registry';

import { resourceRepository } from '@editor/shared/repository/resource-repository';
import type { PreviewRenderer } from './preview-renderer';

class ResourceStoreAdapter implements ResourceStoreLike {
  constructor(private readonly factory: ResourceFactoryLike) {}

  get = async <K extends ExecutableResourceType>(
    id: ResourceId,
    expectedType: K
  ): Promise<InstanceType<ResourceClass<K>>> => {
    const { data: resource } = resourceRepository.useById(id);

    if (!resource) {
      throw new Error(`Resource not found: ${id}`);
    }

    if (resource.type !== expectedType) {
      throw new Error(`Resource type mismatch: expected ${expectedType}, got ${resource.type}`);
    }

    return this.factory.create(resource.data, expectedType);
  };
}

class PreviewAssetCache implements AssetCacheLike {
  constructor(
    private readonly resources: ResourceStoreLike,
    private readonly renderer: PreviewRenderer
  ) {}

  cache = async (id: string, type: ExecutableResourceType) => {
    const resource = await this.resources.get(id, type);

    if (type !== 'image') {
      return;
    }

    if (this.renderer.hasImage(id)) {
      return;
    }

    const bitmap = await resource.toBitmap();

    this.renderer.registerImage(id, bitmap);
  };
}

class PreviewState implements GameStateLike {
  get = () => undefined;
}

export class PreviewContext implements GameContextLike {
  readonly assets: AssetCacheLike;
  readonly factory: ResourceFactoryLike;
  readonly resources: ResourceStoreLike;
  readonly state: GameStateLike;
  readonly schemas: SchemaRegistryLike;

  constructor(
    readonly manifest: ManifestData,
    readonly config: ResourceConfig,
    renderer: PreviewRenderer
  ) {
    this.factory = new ResourceFactory(this);
    this.resources = new ResourceStoreAdapter(this.factory);
    this.assets = new PreviewAssetCache(this.resources, renderer);
    this.schemas = new SchemaRegistry(this.manifest);
    this.state = new PreviewState();
  }
}
