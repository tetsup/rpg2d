import { createStore, type StoreApi } from 'zustand';
import type { ResourceDocument, ResourceRecord } from '@sharedTypes/database/collection';
import type { OperationMode } from '@editor/lib/paint-editor/operation-mode';
import { clampZoom } from '@editor/lib/paint-editor/zoom';
import type { SkinDirection } from '@editor/lib/skin-directions';
import { getDefaultLayerImageIds } from '@editor/lib/texture-layers';

export type GraphicsEntryType = 'skin' | 'texture' | 'image';
export type MetaPanel = GraphicsEntryType | null;

type SkinData = ResourceDocument<'skin'>['data'];
type TextureData = ResourceDocument<'texture'>['data'];

export type GraphicsEditorSessionState = {
  entryId: string;
  entryType: GraphicsEntryType;
  namespace: string;

  activeDirection: SkinDirection;
  activeFrameId: string | null;

  skinId: string | null;
  skinDraft: SkinData | null;
  skinIsDraft: boolean;
  skinRevision: string;

  textureId: string | null;
  textureDraft: TextureData | null;
  textureIsDraft: boolean;
  textureRevision: string;

  imageDirty: boolean;
  metaPanel: MetaPanel;
  operationMode: OperationMode;
  zoom: number;

  setActiveDirection: (direction: SkinDirection) => void;
  setActiveFrameId: (frameId: string | null) => void;
  syncSkin: (resource: ResourceRecord<'skin'>) => void;
  syncTexture: (resource: ResourceRecord<'texture'>) => void;
  patchSkinDraft: (updater: (current: SkinData) => SkinData) => void;
  patchTextureDraft: (updater: (current: TextureData) => TextureData) => void;
  setSkinIsDraft: (isDraft: boolean) => void;
  setTextureIsDraft: (isDraft: boolean) => void;
  setImageDirty: (dirty: boolean) => void;
  setOperationMode: (mode: OperationMode) => void;
  setZoom: (zoom: number) => void;
  openMeta: (panel: Exclude<MetaPanel, null>) => void;
  closeMeta: () => void;
};

function revision(value: unknown) {
  return JSON.stringify(value);
}

export function buildInitialStateFromResource(
  resource: ResourceRecord<'skin' | 'texture' | 'image'>
): GraphicsEditorSessionState {
  const base = {
    entryId: resource.id,
    entryType: resource.type,
    namespace: resource.namespace,
    activeDirection: 'down' as SkinDirection,
    activeFrameId: null as string | null,
    skinId: null as string | null,
    skinDraft: null as SkinData | null,
    skinIsDraft: true,
    skinRevision: '',
    textureId: null as string | null,
    textureDraft: null as TextureData | null,
    textureIsDraft: true,
    textureRevision: '',
    imageDirty: false,
    metaPanel: null as MetaPanel,
    operationMode: 'paint' as OperationMode,
    zoom: 1,
  };

  if (resource.type === 'skin') {
    return {
      ...base,
      skinId: resource.id,
      skinDraft: resource.data,
      skinIsDraft: resource.isDraft,
      skinRevision: revision({ data: resource.data, isDraft: resource.isDraft }),
    };
  }

  if (resource.type === 'texture') {
    const frameIds = getDefaultLayerImageIds(resource.data);
    return {
      ...base,
      textureId: resource.id,
      textureDraft: resource.data,
      textureIsDraft: resource.isDraft,
      textureRevision: revision({ data: resource.data, isDraft: resource.isDraft }),
      activeFrameId: frameIds[0] ?? null,
    };
  }

  return {
    ...base,
    activeFrameId: resource.id,
  };
}

export function createGraphicsEditorSession(resource: ResourceRecord<'skin' | 'texture' | 'image'>) {
  return createStore<GraphicsEditorSessionState>((set, get) => ({
    ...buildInitialStateFromResource(resource),

    setActiveDirection: (direction) => set({ activeDirection: direction, activeFrameId: null }),

    setActiveFrameId: (frameId) => set({ activeFrameId: frameId }),

    syncSkin: (resource) =>
      set({
        skinId: resource.id,
        skinDraft: resource.data,
        skinIsDraft: resource.isDraft,
        skinRevision: revision({ data: resource.data, isDraft: resource.isDraft }),
      }),

    syncTexture: (resource) => {
      const frameIds = getDefaultLayerImageIds(resource.data);
      const state = get();
      set({
        textureId: resource.id,
        textureDraft: resource.data,
        textureIsDraft: resource.isDraft,
        textureRevision: revision({ data: resource.data, isDraft: resource.isDraft }),
        activeFrameId: state.activeFrameId ?? frameIds[0] ?? null,
      });
    },

    patchSkinDraft: (updater) => {
      const current = get().skinDraft;
      if (current == null) return;
      set({ skinDraft: updater(current) });
    },

    patchTextureDraft: (updater) => {
      const current = get().textureDraft;
      if (current == null) return;
      set({ textureDraft: updater(current) });
    },

    setSkinIsDraft: (isDraft) => set({ skinIsDraft: isDraft }),
    setTextureIsDraft: (isDraft) => set({ textureIsDraft: isDraft }),
    setImageDirty: (dirty) => set({ imageDirty: dirty }),
    setOperationMode: (mode) => set({ operationMode: mode }),
    setZoom: (zoom) => set({ zoom: clampZoom(zoom) }),
    openMeta: (panel) => set({ metaPanel: panel }),
    closeMeta: () => set({ metaPanel: null }),
  }));
}

export type GraphicsEditorStore = StoreApi<GraphicsEditorSessionState>;

export function selectSkinDirty(state: GraphicsEditorSessionState) {
  if (state.skinDraft == null) return false;
  return (
    revision({ data: state.skinDraft, isDraft: state.skinIsDraft }) !== state.skinRevision
  );
}

export function selectTextureDirty(state: GraphicsEditorSessionState) {
  if (state.textureDraft == null) return false;
  return (
    revision({ data: state.textureDraft, isDraft: state.textureIsDraft }) !== state.textureRevision
  );
}

export function selectAnyDirty(state: GraphicsEditorSessionState) {
  return selectSkinDirty(state) || selectTextureDirty(state) || state.imageDirty;
}
