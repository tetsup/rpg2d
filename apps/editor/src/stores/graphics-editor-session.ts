import { createStore, type StoreApi } from 'zustand';
import type { ResourceDocument, ResourceRecord } from '@sharedTypes/database/collection';
import type { OperationMode } from '@editor/lib/paint-editor/operation-mode';
import { getDefaultPaletteToken } from '@editor/lib/image-pixel-mutate';
import { clampZoom } from '@editor/lib/paint-editor/zoom';
import type { SkinDirection } from '@editor/lib/skin-directions';
import { getDefaultLayerImageIds } from '@editor/lib/texture-layers';

export type GraphicsEntryType = 'skin' | 'texture' | 'image';

type SkinData = ResourceDocument<'skin'>['data'];
type TextureData = ResourceDocument<'texture'>['data'];
type ImageData = ResourceDocument<'image'>['data'];

export type GraphicsEditorSessionState = {
  entryId: string;
  entryType: GraphicsEntryType;
  namespace: string;

  activeDirection: SkinDirection;
  activeFrameId: string | null;

  skinDraft: SkinData | null;
  skinIsDraft: boolean;
  skinRevision: string;

  textureDraft: TextureData | null;
  textureIsDraft: boolean;
  textureRevision: string;

  imageDraft: ImageData | null;
  imageIsDraft: boolean;
  imageDescription: string;
  imageRevision: string;
  selectedToken: string;

  operationMode: OperationMode;
  zoom: number;

  setActiveDirection: (direction: SkinDirection) => void;
  setActiveFrameId: (frameId: string | null) => void;
  syncSkin: (resource: ResourceRecord<'skin'>) => void;
  syncTexture: (resource: ResourceRecord<'texture'>) => void;
  syncImage: (resource: ResourceRecord<'image'>) => void;
  patchSkinDraft: (updater: (current: SkinData) => SkinData) => void;
  patchTextureDraft: (updater: (current: TextureData) => TextureData) => void;
  patchImageDraft: (updater: (current: ImageData) => ImageData) => void;
  seedImageDraft: (params: {
    data: ImageData;
    isDraft?: boolean;
    description?: string;
  }) => void;
  setSkinIsDraft: (isDraft: boolean) => void;
  setTextureIsDraft: (isDraft: boolean) => void;
  setImageIsDraft: (isDraft: boolean) => void;
  setImageDescription: (description: string) => void;
  setSelectedToken: (token: string) => void;
  setOperationMode: (mode: OperationMode) => void;
  setZoom: (zoom: number) => void;
};

function revision(value: unknown) {
  return JSON.stringify(value);
}

function imageRevisionSnapshot(resource: {
  data: ImageData;
  isDraft: boolean;
  description?: string;
}) {
  return revision({
    data: resource.data,
    isDraft: resource.isDraft,
    description: resource.description ?? '',
  });
}

function clearImageDraftState() {
  return {
    imageDraft: null as ImageData | null,
    imageIsDraft: true,
    imageDescription: '',
    imageRevision: '',
    selectedToken: 'ff',
  };
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
    skinDraft: null as SkinData | null,
    skinIsDraft: true,
    skinRevision: '',
    textureDraft: null as TextureData | null,
    textureIsDraft: true,
    textureRevision: '',
    ...clearImageDraftState(),
    operationMode: 'paint' as OperationMode,
    zoom: 1,
  };

  if (resource.type === 'skin') {
    return {
      ...base,
      skinDraft: resource.data,
      skinIsDraft: resource.isDraft,
      skinRevision: revision({ data: resource.data, isDraft: resource.isDraft }),
    };
  }

  if (resource.type === 'texture') {
    const frameIds = getDefaultLayerImageIds(resource.data);
    return {
      ...base,
      textureDraft: resource.data,
      textureIsDraft: resource.isDraft,
      textureRevision: revision({ data: resource.data, isDraft: resource.isDraft }),
      activeFrameId: frameIds[0] ?? null,
    };
  }

  return {
    ...base,
    activeFrameId: resource.id,
    imageDraft: resource.data,
    imageIsDraft: resource.isDraft,
    imageDescription: resource.description ?? '',
    imageRevision: imageRevisionSnapshot(resource),
    selectedToken: getDefaultPaletteToken(resource.data.palette),
  };
}

export function createGraphicsEditorSession(resource: ResourceRecord<'skin' | 'texture' | 'image'>) {
  return createStore<GraphicsEditorSessionState>((set, get) => ({
    ...buildInitialStateFromResource(resource),

    setActiveDirection: (direction) =>
      set({
        activeDirection: direction,
        activeFrameId: null,
        ...clearImageDraftState(),
      }),

    setActiveFrameId: (frameId) =>
      set({
        activeFrameId: frameId,
        ...clearImageDraftState(),
      }),

    syncSkin: (resource) =>
      set({
        skinDraft: resource.data,
        skinIsDraft: resource.isDraft,
        skinRevision: revision({ data: resource.data, isDraft: resource.isDraft }),
      }),

    syncTexture: (resource) => {
      const frameIds = getDefaultLayerImageIds(resource.data);
      const state = get();
      set({
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

    syncImage: (resource) => {
      if (get().activeFrameId !== resource.id) return;
      set({
        imageDraft: resource.data,
        imageIsDraft: resource.isDraft,
        imageDescription: resource.description ?? '',
        imageRevision: imageRevisionSnapshot(resource),
        selectedToken: getDefaultPaletteToken(resource.data.palette),
      });
    },

    patchImageDraft: (updater) => {
      const current = get().imageDraft;
      if (current == null) return;
      set({ imageDraft: updater(current) });
    },

    seedImageDraft: ({ data, isDraft = true, description = '' }) => {
      if (get().activeFrameId == null) return;
      set({
        imageDraft: data,
        imageIsDraft: isDraft,
        imageDescription: description,
        imageRevision: imageRevisionSnapshot({ data, isDraft, description }),
        selectedToken: getDefaultPaletteToken(data.palette),
      });
    },

    setSkinIsDraft: (isDraft) => set({ skinIsDraft: isDraft }),
    setTextureIsDraft: (isDraft) => set({ textureIsDraft: isDraft }),
    setImageIsDraft: (isDraft) => set({ imageIsDraft: isDraft }),
    setImageDescription: (description) => set({ imageDescription: description }),
    setSelectedToken: (token) => set({ selectedToken: token }),
    setOperationMode: (mode) => set({ operationMode: mode }),
    setZoom: (zoom) => set({ zoom: clampZoom(zoom) }),
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

export function selectImageDirty(state: GraphicsEditorSessionState) {
  if (state.imageDraft == null) return false;
  return (
    revision({
      data: state.imageDraft,
      isDraft: state.imageIsDraft,
      description: state.imageDescription,
    }) !== state.imageRevision
  );
}

export function selectAnyDirty(state: GraphicsEditorSessionState) {
  return selectSkinDirty(state) || selectTextureDirty(state) || selectImageDirty(state);
}
