import { useWorkspaceStore } from '@editor/stores/workspace';
import { ResourceInput } from '@sharedTypes/database/collection';
import { ResourceData, ResourceType } from '@sharedTypes/resource/common';
import { buildActionData } from './action';
import { buildEntityData } from './entity';
import { buildFieldData } from './field';
import { buildFontData } from './font';
import { buildImageData } from './image';
import { buildManifestData } from './manifest';
import { buildPanelData } from './panel';
import { buildPanelSkinData } from './panel-skin';
import { buildPlayerData } from './player';
import { buildSkinData } from './skin';
import { buildTextureData } from './texture';
import { buildTileData } from './tile';

const RESOURCE_VERSION = 0;

type BuildResourceParams<T extends ResourceType> = {
  namespace?: string;
  type: T;
  name?: string;
  isDraft?: boolean;
  data?: ResourceData<T>;
};

function buildResourceData<T extends ResourceType>(type: T, data: Partial<ResourceData<T>> = {}) {
  switch (type) {
    case 'action':
      return buildActionData(data);
    case 'entity':
      return buildEntityData(data);
    case 'field':
      return buildFieldData(data);
    case 'font':
      return buildFontData(data);
    case 'image':
      return buildImageData(data);
    case 'manifest':
      return buildManifestData(data);
    case 'panel':
      return buildPanelData(data);
    case 'panel-skin':
      return buildPanelSkinData(data);
    case 'player':
      return buildPlayerData(data);
    case 'skin':
      return buildSkinData(data);
    case 'texture':
      return buildTextureData(data);
    case 'tile':
      return buildTileData(data);
    default:
      return {};
  }
}

export function useResource<T extends ResourceType>(resource: BuildResourceParams<T>): ResourceInput<T> {
  const { current } = useWorkspaceStore();
  return {
    namespace: resource.namespace ?? current.namespace ?? '',
    type: resource.type,
    name: resource.name ?? '',
    version: RESOURCE_VERSION,
    isDraft: resource.isDraft ?? false,
    data: buildResourceData(resource.type, resource.data),
  };
}
