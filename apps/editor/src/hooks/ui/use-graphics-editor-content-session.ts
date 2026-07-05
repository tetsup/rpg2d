import { useShallow } from 'zustand/react/shallow';
import { useGraphicsEditorSession } from '@editor/providers/graphics-editor-session-provider';
import {
  selectAnyDirty,
  selectImageDirty,
  selectSkinDirty,
  selectTextureDirty,
} from '@editor/stores/graphics-editor-session';

export function useGraphicsEditorContentSession() {
  return useGraphicsEditorSession(
    useShallow((session) => ({
      entryType: session.entryType,
      namespace: session.namespace,
      activeDirection: session.activeDirection,
      activeFrameId: session.activeFrameId,
      skinDraft: session.skinDraft,
      skinIsDraft: session.skinIsDraft,
      textureDraft: session.textureDraft,
      textureIsDraft: session.textureIsDraft,
      imageDraft: session.imageDraft,
      imageIsDraft: session.imageIsDraft,
      imageDescription: session.imageDescription,
      selectedToken: session.selectedToken,
      imageDirty: selectImageDirty(session),
      skinDirty: selectSkinDirty(session),
      textureDirty: selectTextureDirty(session),
      anyDirty: selectAnyDirty(session),
      operationMode: session.operationMode,
      zoom: session.zoom,
      setActiveDirection: session.setActiveDirection,
      setActiveFrameId: session.setActiveFrameId,
      patchSkinDraft: session.patchSkinDraft,
      patchTextureDraft: session.patchTextureDraft,
      patchImageDraft: session.patchImageDraft,
      syncSkin: session.syncSkin,
      syncTexture: session.syncTexture,
      syncImage: session.syncImage,
      seedImageDraft: session.seedImageDraft,
      setSkinIsDraft: session.setSkinIsDraft,
      setTextureIsDraft: session.setTextureIsDraft,
      setImageIsDraft: session.setImageIsDraft,
      setImageDescription: session.setImageDescription,
      setSelectedToken: session.setSelectedToken,
      setOperationMode: session.setOperationMode,
      setZoom: session.setZoom,
    }))
  );
}
