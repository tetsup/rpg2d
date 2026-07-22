import type { SafeParseReturnType } from 'zod';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import type { DatabaseInput } from '@sharedTypes/database/collection';
import { getResourceContextLabel } from './graphics-context-label';

export type GraphicsSaveContext = {
  entryType: GraphicsEntryType;
  imageResource?: ResourceRecord<'image'>;
  imageDirty: boolean;
  imageIsDraft: boolean;
  imageValidation: SafeParseReturnType<DatabaseInput['resources'], DatabaseInput['resources']> | null;
  textureResource?: ResourceRecord<'texture'>;
  textureDirty: boolean;
  textureIsDraft: boolean;
  textureValidation: SafeParseReturnType<DatabaseInput['resources'], DatabaseInput['resources']> | null;
  skinResource?: ResourceRecord<'skin'>;
  skinDirty: boolean;
  skinIsDraft: boolean;
  skinValidation: SafeParseReturnType<DatabaseInput['resources'], DatabaseInput['resources']> | null;
  frameResources: Array<ResourceRecord<'image'> | null | undefined>;
  directionTextureResources?: Array<ResourceRecord<'texture'> | null | undefined>;
};

function validationMessages(
  validation: SafeParseReturnType<DatabaseInput['resources'], DatabaseInput['resources']> | null
): string[] {
  if (validation == null || validation.success) return [];
  return validation.error.issues.map((issue) => issue.message);
}

function collectDraftFrames(frames: Array<ResourceRecord<'image'> | null | undefined>) {
  return frames
    .filter((frame): frame is ResourceRecord<'image'> => frame != null && frame.isDraft)
    .map((frame) => ({
      id: frame.id,
      type: 'image' as const,
      label: getResourceContextLabel(frame.name),
    }));
}

function collectDraftTextures(textures: Array<ResourceRecord<'texture'> | null | undefined>) {
  return textures
    .filter((texture): texture is ResourceRecord<'texture'> => texture != null && texture.isDraft)
    .map((texture) => ({
      id: texture.id,
      type: 'texture' as const,
      label: getResourceContextLabel(texture.name),
    }));
}

export function getAvailableSaveScopes(entryType: GraphicsEntryType): SaveLayerScope[] {
  switch (entryType) {
    case 'image':
      return ['image'];
    case 'texture':
      return ['image', 'texture'];
    case 'skin':
      return ['image', 'texture', 'skin'];
  }
}

export function getCascadeScopes(scope: SaveLayerScope): SaveLayerScope[] {
  switch (scope) {
    case 'image':
      return ['image'];
    case 'texture':
      return ['image', 'texture'];
    case 'skin':
      return ['image', 'texture', 'skin'];
  }
}

export function buildSaveLayerItems(
  context: GraphicsSaveContext,
  labels: { image: string; texture: string; skin: string }
): SaveLayerItem[] {
  const draftFrames = collectDraftFrames(context.frameResources);
  const draftTextures = collectDraftTextures(context.directionTextureResources ?? []);

  const imageItem: SaveLayerItem = {
    scope: 'image',
    label: labels.image,
    isDirty: context.imageDirty,
    isValid: context.imageValidation?.success ?? false,
    hasDraftDescendants: false,
    draftChildren: [],
    invalidMessages: validationMessages(context.imageValidation),
  };

  const textureItem: SaveLayerItem = {
    scope: 'texture',
    label: labels.texture,
    isDirty: context.textureDirty || context.imageDirty,
    isValid:
      (context.textureValidation?.success ?? false) &&
      (context.imageDirty ? (context.imageValidation?.success ?? false) : true),
    hasDraftDescendants: draftFrames.length > 0,
    draftChildren: draftFrames,
    invalidMessages: [
      ...validationMessages(context.textureValidation),
      ...(context.imageDirty ? validationMessages(context.imageValidation) : []),
    ],
  };

  const skinItem: SaveLayerItem = {
    scope: 'skin',
    label: labels.skin,
    isDirty: context.skinDirty || context.textureDirty || context.imageDirty,
    isValid:
      (context.skinValidation?.success ?? false) &&
      (context.textureDirty || context.imageDirty ? textureItem.isValid : true),
    hasDraftDescendants: draftFrames.length > 0 || draftTextures.length > 0,
    draftChildren: [...draftFrames, ...draftTextures],
    invalidMessages: [
      ...validationMessages(context.skinValidation),
      ...(context.textureDirty || context.imageDirty ? textureItem.invalidMessages : []),
    ],
  };

  return getAvailableSaveScopes(context.entryType).map((scope) => {
    switch (scope) {
      case 'image':
        return imageItem;
      case 'texture':
        return textureItem;
      case 'skin':
        return skinItem;
    }
  });
}

export function getSaveLayerItem(items: SaveLayerItem[], scope: SaveLayerScope): SaveLayerItem | undefined {
  return items.find((item) => item.scope === scope);
}

export function scopeHasChanges(item: SaveLayerItem): boolean {
  return item.isDirty;
}

export async function executeGraphicsSave({
  scope,
  context,
  updateResource,
  syncTexture,
  syncSkin,
  syncImage,
}: {
  scope: SaveLayerScope;
  context: GraphicsSaveContext;
  updateResource: (args: { id: string; body: DatabaseInput['resources'] }) => Promise<void>;
  syncTexture?: (resource: ResourceRecord<'texture'>) => void;
  syncSkin?: (resource: ResourceRecord<'skin'>) => void;
  syncImage?: (resource: ResourceRecord<'image'>) => void;
}): Promise<void> {
  for (const layerScope of getCascadeScopes(scope)) {
    if (layerScope === 'image') {
      if (
        !context.imageDirty ||
        context.imageResource == null ||
        context.imageValidation == null ||
        !context.imageValidation.success
      ) {
        continue;
      }
      await updateResource({
        id: context.imageResource.id,
        body: context.imageValidation.data,
      });
      syncImage?.({
        ...context.imageResource,
        data: context.imageValidation.data.data,
        isDraft: context.imageValidation.data.isDraft,
        description: context.imageValidation.data.description,
      });
      continue;
    }

    if (layerScope === 'texture') {
      if (
        !context.textureDirty ||
        context.textureResource == null ||
        context.textureValidation == null ||
        !context.textureValidation.success
      ) {
        continue;
      }
      await updateResource({
        id: context.textureResource.id,
        body: context.textureValidation.data,
      });
      syncTexture?.({
        ...context.textureResource,
        data: context.textureValidation.data.data,
        isDraft: context.textureValidation.data.isDraft,
      });
      continue;
    }

    if (layerScope === 'skin') {
      if (
        !context.skinDirty ||
        context.skinResource == null ||
        context.skinValidation == null ||
        !context.skinValidation.success
      ) {
        continue;
      }
      await updateResource({
        id: context.skinResource.id,
        body: context.skinValidation.data,
      });
      syncSkin?.({
        ...context.skinResource,
        data: context.skinValidation.data.data,
        isDraft: context.skinValidation.data.isDraft,
      });
    }
  }
}
