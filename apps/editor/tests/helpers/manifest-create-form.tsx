import { type DefaultValues, type FieldPath, FormProvider, useForm, useFormContext, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { FieldGroupTemplate } from '@editor/components/features/form/field-templete';
import { DraftModeToggle } from '@editor/components/features/form/draft-mode-toggle';
import { SubmitCard } from '@editor/components/parts/submit-card';
import { documentKey } from '@editor/hooks/api/by-id';
import {
  createManifestCreateDefaultValues,
  ManifestForm,
  manifestInputSchema,
} from '@editor/forms/manifest';
import type { ResourceInput } from '@sharedTypes/database/collection';

export const manifestTestFieldId = 'sample/field/start-field.v0';
export const manifestTestPanelId = 'sample/panel/message.v0';
export const manifestTestNamespaceId = 'sample';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function seedManifestPickerDocuments(queryClient: QueryClient) {
  queryClient.setQueryData(documentKey('namespaces', manifestTestNamespaceId), {
    id: manifestTestNamespaceId,
    presenceName: 'Sample',
    description: '',
    isPrivate: false,
  });

  queryClient.setQueryData(documentKey('resources', manifestTestFieldId), {
    id: manifestTestFieldId,
    namespace: 'sample',
    type: 'field',
    name: 'start-field.v0',
    version: 0,
    description: '',
    isDraft: false,
    data: {
      name: 'はじまりのしま',
      tiles: {},
      map: [],
    },
  });

  queryClient.setQueryData(documentKey('resources', manifestTestPanelId), {
    id: manifestTestPanelId,
    namespace: 'sample',
    type: 'panel',
    name: 'message.v0',
    version: 0,
    description: '',
    isDraft: false,
    data: {
      skin: 'sample/panel-skin/message.v0',
      layout: {
        anchorType: 'screen',
        anchor: 'bottom-left',
        pos: { x: 1, y: -6 },
        size: { width: 18, height: 5 },
      },
      content: {
        type: 'message',
        staticContents: [],
        variantContents: [],
      },
    },
  });
}

type PickerAssignment = {
  name: FieldPath<ResourceInput<'manifest'>>;
  value: string | null;
};

function FormStateProbe() {
  const { isValid, isDirty } = useFormState<ResourceInput<'manifest'>>();

  return <div data-testid="form-state" data-valid={String(isValid)} data-dirty={String(isDirty)} />;
}

function PickerValueSetter({ assignments }: { assignments: PickerAssignment[] }) {
  const { setValue, trigger } = useFormContext<ResourceInput<'manifest'>>();

  return (
    <button
      type="button"
      data-testid="apply-picker-values"
      onClick={() => {
        for (const { name, value } of assignments) {
          setValue(name, value, { shouldDirty: true, shouldValidate: true });
        }
        void trigger();
      }}
    >
      apply pickers
    </button>
  );
}

type ManifestCreateFormHarnessProps = {
  onSubmit: (values: ResourceInput<'manifest'>) => Promise<void> | void;
  pickerAssignments?: PickerAssignment[];
  defaultValues?: DefaultValues<ResourceInput<'manifest'>>;
};

function ManifestCreateFormHarness({
  onSubmit,
  pickerAssignments = [],
  defaultValues = createManifestCreateDefaultValues(),
}: ManifestCreateFormHarnessProps) {
  const fields = ManifestForm({ mode: 'create' });
  const form = useForm<ResourceInput<'manifest'>>({
    resolver: zodResolver(manifestInputSchema),
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
          {pickerAssignments.length > 0 && <PickerValueSetter assignments={pickerAssignments} />}
          <DraftModeToggle />
          <SubmitCard />
          <FormStateProbe />
        </div>
      </form>
    </FormProvider>
  );
}

type RenderManifestCreateFormOptions = Omit<RenderOptions, 'wrapper'> & {
  onSubmit?: (values: ResourceInput<'manifest'>) => Promise<void> | void;
  pickerAssignments?: PickerAssignment[];
  defaultValues?: DefaultValues<ResourceInput<'manifest'>>;
  seedDocuments?: boolean;
};

export function renderManifestCreateForm({
  onSubmit = () => undefined,
  pickerAssignments,
  defaultValues,
  seedDocuments = true,
  ...options
}: RenderManifestCreateFormOptions = {}) {
  const queryClient = createTestQueryClient();
  if (seedDocuments) {
    seedManifestPickerDocuments(queryClient);
  }

  const view = render(
    <QueryClientProvider client={queryClient}>
      <ManifestCreateFormHarness
        onSubmit={onSubmit}
        pickerAssignments={pickerAssignments}
        defaultValues={defaultValues}
      />
    </QueryClientProvider>,
    options
  );

  return { queryClient, onSubmit, ...view };
}

export function getFormState(container: HTMLElement) {
  const probe = container.querySelector('[data-testid="form-state"]');
  if (!probe) {
    throw new Error('form-state probe not found');
  }

  return {
    isValid: probe.getAttribute('data-valid') === 'true',
    isDirty: probe.getAttribute('data-dirty') === 'true',
  };
}

export function manifestPickerAssignments(
  overrides: Partial<Record<'namespace' | 'fieldId' | 'defaultMessagePanel', string | null>> = {}
): PickerAssignment[] {
  return [
    {
      name: 'namespace',
      value: overrides.namespace !== undefined ? overrides.namespace : manifestTestNamespaceId,
    },
    {
      name: 'data.initialState.field.fieldId',
      value: overrides.fieldId !== undefined ? overrides.fieldId : manifestTestFieldId,
    },
    {
      name: 'data.config.defaultMessagePanel',
      value:
        overrides.defaultMessagePanel !== undefined
          ? overrides.defaultMessagePanel
          : manifestTestPanelId,
    },
  ];
}

export async function fillManifestProjectName(user: UserEvent, name = 'v0') {
  await user.type(screen.getByLabelText('プロジェクト名'), name);
}

export async function applyManifestPickerValues(user: UserEvent) {
  await user.click(screen.getByTestId('apply-picker-values'));
}

export async function setManifestSaveMode(user: UserEvent, mode: 'draft' | 'ready') {
  await user.click(screen.getByRole('button', { name: mode === 'draft' ? '下書き' : '正式' }));
}

export function getSaveButton() {
  return screen.getByRole('button', { name: /^保存$/ });
}
