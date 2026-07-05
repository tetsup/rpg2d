import { describe, expect, it } from 'vitest';
import { setImagePixel } from '@editor/lib/image-pixel-mutate';
import {
  createGraphicsEditorSession,
  selectImageDirty,
} from '@editor/stores/graphics-editor-session';
import { sampleImageResource, sampleTextureResource } from '../helpers/graphics-save-fixtures';

describe('graphics editor session image draft', () => {
  it('tracks image dirty state from revision snapshots', () => {
    const store = createGraphicsEditorSession(sampleImageResource);

    expect(selectImageDirty(store.getState())).toBe(false);

    store.getState().setImageIsDraft(false);

    expect(selectImageDirty(store.getState())).toBe(true);
  });

  it('seeds image draft immediately for newly created frames', () => {
    const store = createGraphicsEditorSession(sampleTextureResource);

    const nextId = 'sample/image/hero.down-ab';
    store.getState().setActiveFrameId(nextId);
    store.getState().seedImageDraft({
      id: nextId,
      data: sampleImageResource.data,
    });

    expect(store.getState().imageDraft).toEqual(sampleImageResource.data);
    expect(selectImageDirty(store.getState())).toBe(false);
  });

  it('syncs image draft when the active frame resource loads', () => {
    const store = createGraphicsEditorSession(sampleTextureResource);

    store.getState().syncImage(sampleImageResource);

    expect(store.getState().imageDraft).toEqual(sampleImageResource.data);
    expect(store.getState().selectedToken).toBe('aa');
  });

  it('marks pixel edits as dirty', () => {
    const store = createGraphicsEditorSession(sampleImageResource);

    store.getState().patchImageDraft((current) => setImagePixel(current, 0, 0, 'bb'));

    expect(selectImageDirty(store.getState())).toBe(true);
  });
});
