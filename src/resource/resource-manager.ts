import { parse } from 'yaml';
import type { ZodType } from 'zod';
import type { ResourceId, RpgConfig, RpgManifest, RpgState } from '@/types/engine';
import type { ResourceBase, ResourceDefinition } from './resource-base';
import { ImageCache } from './image-cache';

export class ResourceManager {
  initialState: RpgState;
  resources: Map<ResourceId, ResourceBase<any>> = new Map();
  localResources?: Map<ResourceId, ResourceDefinition[keyof ResourceDefinition]['data']>;
  images: ImageCache;
  config: RpgConfig;
  constructor(
    private manifest: RpgManifest,
    localGlob?: Record<string, any>,
    localImages?: Record<ResourceId, ImageBitmap>
  ) {
    this.initialState = this.manifest.initialState;
    this.config = this.manifest.config;
    this.resources = new Map();
    if (localGlob !== undefined) this.loadLocalResources(localGlob);
    this.images = new ImageCache(localImages);
  }

  private loadLocalResources(localGlob: Record<string, any>) {
    Object.values(localGlob).forEach((localResourceYaml) => {
      const localResource = parse(localResourceYaml);
      this.resources.set(localResource.id, localResource);
    });
  }

  private async resolve<K extends keyof ResourceDefinition>(
    id: ResourceId,
    schema: ZodType<any>,
    factory: (resources: ResourceManager, data: any) => Promise<InstanceType<ResourceDefinition[K]['class']>>
  ) {
    const data = await this.fetch(id);
    const parsed = schema.parse(data);
    return await factory(this, parsed);
  }

  private async fetch(id: ResourceId): Promise<unknown> {
    const local = this.localResources?.get(id);
    if (local !== undefined) return local;
    const res = await fetch(`${process.env.RESOURCE_URI}/${id}`);
    return await res.json();
  }

  async get<K extends keyof ResourceDefinition>(
    id: ResourceId,
    schema: ZodType<any>,
    factory: (resources: ResourceManager, data: any) => Promise<InstanceType<ResourceDefinition[K]['class']>>
  ) {
    const resource = this.resources.get(id);
    if (resource !== undefined) return resource;
    const createdResource = await this.resolve(id, schema, factory);
    this.resources.set(id, createdResource);
    return createdResource;
  }
}
