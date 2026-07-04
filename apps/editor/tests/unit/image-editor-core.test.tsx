import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useImageEditorState } from '@editor/components/features/graphics/image-editor-core';
import { setImagePixel } from '@editor/lib/image-pixel-mutate';
import { sampleImageResource } from '../helpers/graphics-save-fixtures';

describe('useImageEditorState', () => {
  it('starts clean when draft matches the loaded resource', () => {
    const { result } = renderHook(() => useImageEditorState(sampleImageResource));

    expect(result.current.isDirty).toBe(false);
    expect(result.current.validation?.success).toBe(true);
    expect(result.current.selectedToken).toBe('aa');
  });

  it('marks isDraft changes as dirty and reflects them in validation', () => {
    const { result } = renderHook(() => useImageEditorState(sampleImageResource));

    act(() => {
      result.current.setIsDraft(false);
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.validation?.success).toBe(true);
    expect(result.current.validation?.data).toMatchObject({
      isDraft: false,
      name: sampleImageResource.name,
    });
  });

  it('marks description changes as dirty and includes them in validation', () => {
    const { result } = renderHook(() => useImageEditorState(sampleImageResource));

    act(() => {
      result.current.setDescription('hero frame');
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.validation?.data).toMatchObject({
      description: 'hero frame',
    });
  });

  it('marks pixel edits as dirty and serializes updated pixels in validation', () => {
    const { result } = renderHook(() => useImageEditorState(sampleImageResource));

    act(() => {
      result.current.setDraftData((current) =>
        current ? setImagePixel(current, 0, 0, 'bb') : current
      );
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.validation?.success).toBe(true);
    expect(result.current.validation?.data?.data.pixels[0]).toBe('bb aa');
  });

  it('notifies dirty changes through the callback', () => {
    const onDirtyChange = vi.fn();
    const { result } = renderHook(() => useImageEditorState(sampleImageResource, onDirtyChange));

    expect(onDirtyChange).toHaveBeenLastCalledWith(false);

    act(() => {
      result.current.setIsDraft(false);
    });

    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('starts with fresh state when mounted for a different resource', () => {
    const { result: first } = renderHook(() => useImageEditorState(sampleImageResource));

    act(() => {
      first.current.setIsDraft(false);
      first.current.setDescription('temporary');
    });

    const nextResource = {
      ...sampleImageResource,
      id: 'sample/image/hero.down-ab',
      name: 'hero.down-ab',
      isDraft: true,
      description: 'loaded',
    };

    const { result: second } = renderHook(() => useImageEditorState(nextResource));

    expect(second.current.isDirty).toBe(false);
    expect(second.current.isDraft).toBe(true);
    expect(second.current.description).toBe('loaded');
  });
});
