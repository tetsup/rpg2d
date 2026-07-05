import { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import type { GraphicsSaveContext } from '@editor/lib/graphics-save-plan';

const now = new Date().toISOString();

export const sampleImageResource: ResourceRecord<'image'> = {
  id: 'sample/image/hero.down-aa',
  namespace: 'sample',
  type: 'image',
  name: 'hero.down-aa',
  version: 0,
  isDraft: true,
  description: '',
  data: {
    size: { width: 2, height: 2 },
    palette: {
      aa: [0, 0, 0, 255],
      bb: [255, 0, 0, 255],
    },
    pixels: ['aa aa', 'aa aa'],
  },
  createdAt: now,
  updatedAt: now,
  createdBy: 'test-user',
};

export const sampleTextureResource: ResourceRecord<'texture'> = {
  id: 'sample/texture/hero.down',
  namespace: 'sample',
  type: 'texture',
  name: 'hero.down',
  version: 0,
  isDraft: true,
  data: {
    layers: [{ priority: 8, images: ['sample/image/hero.down-aa'] }],
  },
  createdAt: now,
  updatedAt: now,
  createdBy: 'test-user',
};

export const sampleSkinResource: ResourceRecord<'skin'> = {
  id: 'sample/skin/hero',
  namespace: 'sample',
  type: 'skin',
  name: 'hero',
  version: 0,
  isDraft: true,
  data: {
    textures: {
      down: 'sample/texture/hero.down',
      up: null,
      left: null,
      right: null,
    },
  },
  createdAt: now,
  updatedAt: now,
  createdBy: 'test-user',
};

export const saveLabels = {
  image: '画像',
  texture: 'テクスチャ',
  skin: 'スキン',
};

export function parseImageInput(
  resource: ResourceRecord<'image'>,
  overrides: { isDraft?: boolean; description?: string; data?: ResourceRecord<'image'>['data'] } = {}
) {
  return createResourceInputSchema('image').safeParse({
    namespace: resource.namespace,
    type: 'image',
    name: resource.name,
    version: resource.version,
    description: overrides.description ?? resource.description ?? '',
    isDraft: overrides.isDraft ?? resource.isDraft,
    data: overrides.data ?? resource.data,
  });
}

export function parseTextureInput(
  resource: ResourceRecord<'texture'>,
  overrides: { isDraft?: boolean; data?: ResourceRecord<'texture'>['data'] } = {}
) {
  return createResourceInputSchema('texture').safeParse({
    namespace: resource.namespace,
    type: 'texture',
    name: resource.name,
    version: resource.version,
    description: resource.description ?? '',
    isDraft: overrides.isDraft ?? resource.isDraft,
    data: overrides.data ?? resource.data,
  });
}

export function parseSkinInput(
  resource: ResourceRecord<'skin'>,
  overrides: { isDraft?: boolean; data?: ResourceRecord<'skin'>['data'] } = {}
) {
  return createResourceInputSchema('skin').safeParse({
    namespace: resource.namespace,
    type: 'skin',
    name: resource.name,
    version: resource.version,
    description: resource.description ?? '',
    isDraft: overrides.isDraft ?? resource.isDraft,
    data: overrides.data ?? resource.data,
  });
}

export function createSaveContext(overrides: Partial<GraphicsSaveContext> = {}): GraphicsSaveContext {
  const imageValidation = parseImageInput(sampleImageResource);
  const textureValidation = parseTextureInput(sampleTextureResource);
  const skinValidation = parseSkinInput(sampleSkinResource);

  return {
    entryType: 'image',
    imageResource: sampleImageResource,
    imageDirty: false,
    imageIsDraft: true,
    imageValidation,
    textureResource: sampleTextureResource,
    textureDirty: false,
    textureIsDraft: true,
    textureValidation,
    skinResource: sampleSkinResource,
    skinDirty: false,
    skinIsDraft: true,
    skinValidation,
    frameResources: [sampleImageResource],
    directionTextureResources: [sampleTextureResource],
    ...overrides,
  };
}
