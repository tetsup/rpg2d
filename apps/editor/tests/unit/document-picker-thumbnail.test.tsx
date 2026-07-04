import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentPicker } from '@editor/components/parts/document-picker';
import { documentKey } from '@editor/hooks/api/by-id';

const testTextureId = 'sample/texture/grass.v0';

const testTexture = {
  id: testTextureId,
  namespace: 'sample',
  type: 'texture',
  name: 'grass.v0',
  version: 0,
  description: 'floor',
  isDraft: false,
  data: {
    layers: [
      {
        priority: 8,
        images: ['sample/image/grass-aa'],
      },
    ],
  },
};

const testImage = {
  id: 'sample/image/grass-aa',
  namespace: 'sample',
  type: 'image',
  name: 'grass-aa',
  version: 0,
  description: '',
  isDraft: false,
  data: {
    size: { width: 16, height: 16 },
    palette: { ff: [0, 255, 0, 255] },
    pixels: Array(16).fill(Array(16).fill('ff').join(' ')),
  },
};

function createTestQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  queryClient.setQueryData(documentKey('resources', testTextureId), testTexture);
  queryClient.setQueryData(documentKey('resources', testImage.id), testImage);

  return queryClient;
}

describe('DocumentPicker thumbnail trigger', () => {
  it('shows a canvas preview for selected texture resources', async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <DocumentPicker
          collectionName="resources"
          value={testTextureId}
          onSelect={() => undefined}
          resourceType="texture"
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('grass.v0: floor');
    });

    expect(screen.getByRole('button').querySelector('canvas')).not.toBeNull();
  });

  it('shows label only when thumbnail preview is disabled', async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <DocumentPicker
          collectionName="resources"
          value={testTextureId}
          onSelect={() => undefined}
          resourceType="texture"
          showThumbnail={false}
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('grass.v0: floor');
    });

    expect(screen.getByRole('button').querySelector('canvas')).toBeNull();
  });
});
