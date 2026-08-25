import type { ResourceId } from '@sharedTypes/resource/common';
import type { ResourceStoreLike } from '@engine/resource/core/resource-store';
import type { ResourceFactoryLike } from '@engine/resource/core/resource-factory';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { PreviewResourceInstanceMap, type PreviewableResourceType } from './preview-factory';

export class ResourceStoreAdapter implements ResourceStoreLike<PreviewResourceInstanceMap> {
  constructor(private readonly factory: ResourceFactoryLike<PreviewResourceInstanceMap>) {}

  get = async <K extends PreviewableResourceType>(
    id: ResourceId,
    expectedType: K
  ): Promise<PreviewResourceInstanceMap[K]> => {
    const { data: resource } = resourceRepository.useById(id);
    if (!resource) throw new Error(`Resource not found: ${id}`);
    if (resource.type !== expectedType)
      throw new Error(`Resource type mismatch: expected ${expectedType}, got ${resource.type}`);

    return this.factory.create(id, resource.data, expectedType);
  };
}
