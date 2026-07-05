import { describe, expect, it, vi } from 'vitest';
import {
  buildSaveLayerItems,
  executeGraphicsSave,
  getAvailableSaveScopes,
  getCascadeScopes,
  getSaveLayerItem,
} from '@editor/lib/graphics-save-plan';
import {
  createSaveContext,
  parseImageInput,
  parseSkinInput,
  parseTextureInput,
  sampleImageResource,
  sampleSkinResource,
  sampleTextureResource,
  saveLabels,
} from '../helpers/graphics-save-fixtures';

describe('getAvailableSaveScopes', () => {
  it('returns scopes for each entry type', () => {
    expect(getAvailableSaveScopes('image')).toEqual(['image']);
    expect(getAvailableSaveScopes('texture')).toEqual(['image', 'texture']);
    expect(getAvailableSaveScopes('skin')).toEqual(['image', 'texture', 'skin']);
  });
});

describe('getCascadeScopes', () => {
  it('expands parent scopes to child-first cascade order', () => {
    expect(getCascadeScopes('image')).toEqual(['image']);
    expect(getCascadeScopes('texture')).toEqual(['image', 'texture']);
    expect(getCascadeScopes('skin')).toEqual(['image', 'texture', 'skin']);
  });
});

describe('buildSaveLayerItems', () => {
  it('builds a single image item for image entry', () => {
    const items = buildSaveLayerItems(
      createSaveContext({ entryType: 'image', imageDirty: true }),
      saveLabels
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      scope: 'image',
      label: '画像',
      isDirty: true,
      isValid: true,
      hasDraftDescendants: false,
      draftChildren: [],
      invalidMessages: [],
    });
  });

  it('marks texture scope dirty when the active image is dirty', () => {
    const items = buildSaveLayerItems(
      createSaveContext({
        entryType: 'texture',
        imageDirty: true,
        textureDirty: false,
      }),
      saveLabels
    );

    const textureItem = getSaveLayerItem(items, 'texture');
    expect(textureItem?.isDirty).toBe(true);
    expect(textureItem?.isValid).toBe(true);
  });

  it('collects draft frame children on texture and skin scopes', () => {
    const publishedFrame = { ...sampleImageResource, isDraft: false };
    const draftFrame = { ...sampleImageResource, id: 'sample/image/hero.down-ab', isDraft: true, name: 'hero.down-ab' };
    const items = buildSaveLayerItems(
      createSaveContext({
        entryType: 'texture',
        frameResources: [publishedFrame, draftFrame],
      }),
      saveLabels
    );

    const textureItem = getSaveLayerItem(items, 'texture');
    expect(textureItem?.hasDraftDescendants).toBe(true);
    expect(textureItem?.draftChildren).toEqual([
      { id: draftFrame.id, type: 'image', label: 'ab' },
    ]);
  });

  it('collects draft textures on skin scope', () => {
    const draftTexture = { ...sampleTextureResource, isDraft: true, name: 'hero.up' };
    const items = buildSaveLayerItems(
      createSaveContext({
        entryType: 'skin',
        directionTextureResources: [sampleTextureResource, draftTexture],
      }),
      saveLabels
    );

    const skinItem = getSaveLayerItem(items, 'skin');
    expect(skinItem?.draftChildren).toEqual(
      expect.arrayContaining([{ id: draftTexture.id, type: 'texture', label: 'up' }])
    );
  });

  it('includes image validation errors in texture scope when image is dirty', () => {
    const invalidImage = parseImageInput(sampleImageResource, {
      data: {
        ...sampleImageResource.data,
        pixels: ['aa'],
      },
    });

    const items = buildSaveLayerItems(
      createSaveContext({
        entryType: 'texture',
        imageDirty: true,
        imageValidation: invalidImage,
      }),
      saveLabels
    );

    const textureItem = getSaveLayerItem(items, 'texture');
    expect(textureItem?.isValid).toBe(false);
    expect(textureItem?.invalidMessages.length).toBeGreaterThan(0);
  });

  it('keeps skin scope valid when only skin draft changed', () => {
    const items = buildSaveLayerItems(
      createSaveContext({
        entryType: 'skin',
        skinDirty: true,
        imageDirty: false,
        textureDirty: false,
      }),
      saveLabels
    );

    const skinItem = getSaveLayerItem(items, 'skin');
    expect(skinItem?.isDirty).toBe(true);
    expect(skinItem?.isValid).toBe(true);
    expect(skinItem?.invalidMessages).toEqual([]);
  });
});

describe('executeGraphicsSave', () => {
  it('saves only the image when image scope is selected and image is dirty', async () => {
    const updateResource = vi.fn().mockResolvedValue(undefined);
    const imageValidation = parseImageInput(sampleImageResource, { isDraft: false });

    await executeGraphicsSave({
      scope: 'image',
      context: createSaveContext({
        imageDirty: true,
        imageValidation,
      }),
      updateResource,
    });

    expect(updateResource).toHaveBeenCalledTimes(1);
    expect(updateResource).toHaveBeenCalledWith({
      id: sampleImageResource.id,
      body: imageValidation.data,
    });
  });

  it('skips image PUT when image is clean under texture scope', async () => {
    const updateResource = vi.fn().mockResolvedValue(undefined);
    const textureValidation = parseTextureInput(sampleTextureResource, { isDraft: false });

    await executeGraphicsSave({
      scope: 'texture',
      context: createSaveContext({
        entryType: 'texture',
        imageDirty: false,
        textureDirty: true,
        textureValidation,
      }),
      updateResource,
    });

    expect(updateResource).toHaveBeenCalledTimes(1);
    expect(updateResource).toHaveBeenCalledWith({
      id: sampleTextureResource.id,
      body: textureValidation.data,
    });
  });

  it('cascades image then texture PUTs in order for texture scope', async () => {
    const updateResource = vi.fn().mockResolvedValue(undefined);
    const syncTexture = vi.fn();
    const imageValidation = parseImageInput(sampleImageResource, { isDraft: false });
    const textureValidation = parseTextureInput(sampleTextureResource, { isDraft: false });

    await executeGraphicsSave({
      scope: 'texture',
      context: createSaveContext({
        entryType: 'texture',
        imageDirty: true,
        textureDirty: true,
        imageValidation,
        textureValidation,
      }),
      updateResource,
      syncTexture,
    });

    expect(updateResource.mock.calls.map(([call]) => call.id)).toEqual([
      sampleImageResource.id,
      sampleTextureResource.id,
    ]);
    expect(syncTexture).toHaveBeenCalledWith({
      ...sampleTextureResource,
      data: textureValidation.data!.data,
      isDraft: false,
    });
  });

  it('cascades image, texture, then skin PUTs for skin scope', async () => {
    const updateResource = vi.fn().mockResolvedValue(undefined);
    const syncTexture = vi.fn();
    const syncSkin = vi.fn();
    const imageValidation = parseImageInput(sampleImageResource, { isDraft: false });
    const textureValidation = parseTextureInput(sampleTextureResource, { isDraft: false });
    const skinValidation = parseSkinInput(sampleSkinResource, { isDraft: true });

    await executeGraphicsSave({
      scope: 'skin',
      context: createSaveContext({
        entryType: 'skin',
        imageDirty: true,
        textureDirty: true,
        skinDirty: true,
        imageValidation,
        textureValidation,
        skinValidation,
      }),
      updateResource,
      syncTexture,
      syncSkin,
    });

    expect(updateResource.mock.calls.map(([call]) => call.id)).toEqual([
      sampleImageResource.id,
      sampleTextureResource.id,
      sampleSkinResource.id,
    ]);
    expect(syncSkin).toHaveBeenCalledWith({
      ...sampleSkinResource,
      data: skinValidation.data!.data,
      isDraft: true,
    });
  });

  it('does not PUT layers that fail validation', async () => {
    const updateResource = vi.fn().mockResolvedValue(undefined);
    const invalidImage = parseImageInput(sampleImageResource, {
      data: {
        ...sampleImageResource.data,
        pixels: ['aa'],
      },
    });

    await executeGraphicsSave({
      scope: 'texture',
      context: createSaveContext({
        entryType: 'texture',
        imageDirty: true,
        textureDirty: true,
        imageValidation: invalidImage,
        textureValidation: parseTextureInput(sampleTextureResource, { isDraft: false }),
      }),
      updateResource,
    });

    expect(updateResource).toHaveBeenCalledTimes(1);
    expect(updateResource.mock.calls[0]?.[0].id).toBe(sampleTextureResource.id);
  });

  it('propagates updateResource failures without calling later layers', async () => {
    const updateResource = vi
      .fn()
      .mockRejectedValueOnce(new Error('image save failed'))
      .mockResolvedValue(undefined);

    await expect(
      executeGraphicsSave({
        scope: 'texture',
        context: createSaveContext({
          entryType: 'texture',
          imageDirty: true,
          textureDirty: true,
          imageValidation: parseImageInput(sampleImageResource, { isDraft: false }),
          textureValidation: parseTextureInput(sampleTextureResource, { isDraft: false }),
        }),
        updateResource,
      })
    ).rejects.toThrow('image save failed');

    expect(updateResource).toHaveBeenCalledTimes(1);
  });
});
