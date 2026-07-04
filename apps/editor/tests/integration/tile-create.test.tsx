import { type DefaultValues, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FieldGroupTemplate } from '@editor/components/features/form/field-templete';
import { DraftModeToggle } from '@editor/components/features/form/draft-mode-toggle';
import { SubmitCard } from '@editor/components/parts/submit-card';
import { createTileDefaultValues, TileForm, tileInputSchema } from '@editor/forms/tile';
import { NewResourceByNamespacePage } from '@editor/route/resource/new-by-namespace';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { renderEditor } from '../helpers/render-app';

const testTextureId = 'sample/texture/grass.v0';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function TextureValueSetter() {
  const { setValue, trigger } = useFormContext<ResourceInput<'tile'>>();

  return (
    <button
      type="button"
      data-testid="apply-texture"
      onClick={() => {
        setValue('data.texture', testTextureId, { shouldDirty: true, shouldValidate: true });
        void trigger();
      }}
    >
      apply texture
    </button>
  );
}

function TileCreateFormHarness({
  onSubmit,
  defaultValues = createTileDefaultValues('sample'),
}: {
  onSubmit: (values: ResourceInput<'tile'>) => Promise<void> | void;
  defaultValues?: DefaultValues<ResourceInput<'tile'>>;
}) {
  const fields = TileForm({ mode: 'create' });
  const form = useForm<ResourceInput<'tile'>>({
    resolver: zodResolver(tileInputSchema),
    mode: 'onChange',
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {fields.map((fieldGroup, index) => (
            <FieldGroupTemplate key={index} {...fieldGroup} />
          ))}
          <TextureValueSetter />
          <DraftModeToggle />
          <SubmitCard />
        </div>
      </form>
    </FormProvider>
  );
}

function renderTileCreateForm(options?: {
  onSubmit?: (values: ResourceInput<'tile'>) => Promise<void> | void;
}) {
  const queryClient = createTestQueryClient();
  const onSubmit = options?.onSubmit ?? vi.fn();

  const view = render(
    <QueryClientProvider client={queryClient}>
      <TileCreateFormHarness onSubmit={onSubmit} />
    </QueryClientProvider>
  );

  return { onSubmit, ...view };
}

function renderTileRoutes(initialEntry: string) {
  return renderEditor(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/resources/:namespace/:type/new" element={<NewResourceByNamespacePage />} />
        <Route path="/resources/:namespace/:type/:name" element={<div>tile edit</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('tile create form', () => {
  it('renders the create form for tile type', async () => {
    renderTileRoutes('/resources/sample/tile/new');

    await waitFor(() => {
      expect(screen.getByLabelText('名前')).toBeInTheDocument();
      expect(screen.getByLabelText('テクスチャ')).toBeInTheDocument();
      expect(screen.getByLabelText('重ね表示')).toBeInTheDocument();
    });
  });

  it('submits a draft tile when name and texture are filled', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderTileCreateForm({ onSubmit });

    await user.type(screen.getByLabelText('名前'), 'grass.v0');
    await user.click(screen.getByTestId('apply-texture'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^保存$/ })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /^保存$/ }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      namespace: 'sample',
      type: 'tile',
      name: 'grass.v0',
      isDraft: true,
      data: {
        texture: testTextureId,
        allowOverwrap: false,
      },
    });
  });
});
