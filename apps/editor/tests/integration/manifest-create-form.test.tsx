import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  applyManifestPickerValues,
  fillManifestProjectName,
  getFormState,
  getSaveButton,
  manifestPickerAssignments,
  manifestTestNamespaceId,
  renderManifestCreateForm,
  setManifestSaveMode,
} from '../helpers/manifest-create-form';

describe('manifest create form', () => {
  it('keeps the form invalid and submit disabled before required meta fields are filled', async () => {
    const { container } = renderManifestCreateForm();

    await waitFor(() => {
      expect(getFormState(container).isValid).toBe(false);
    });

    expect(screen.getByRole('button', { name: /^保存$/ })).toBeDisabled();
  });

  it('becomes valid when text fields are filled and picker ids are applied under FormProvider', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { container } = renderManifestCreateForm({
      onSubmit,
      pickerAssignments: manifestPickerAssignments(),
    });

    await user.type(screen.getByLabelText('プロジェクト名'), 'v0');
    await user.click(screen.getByTestId('apply-picker-values'));

    await waitFor(() => {
      expect(getFormState(container).isValid).toBe(true);
      expect(getFormState(container).isDirty).toBe(true);
    });

    expect(screen.getByRole('button', { name: /^保存$/ })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /^保存$/ }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      namespace: manifestTestNamespaceId,
      name: 'v0',
      isDraft: true,
      data: {
        initialState: {
          field: {
            fieldId: 'sample/field/start-field.v0',
          },
        },
        config: {
          defaultMessagePanel: 'sample/panel/message.v0',
        },
      },
    });
  });

  it('stays valid in draft when picker ids are null after meta fields are filled', async () => {
    const user = userEvent.setup();

    const { container } = renderManifestCreateForm({
      pickerAssignments: manifestPickerAssignments({
        fieldId: null,
        defaultMessagePanel: null,
      }),
    });

    await user.type(screen.getByLabelText('プロジェクト名'), 'v0');
    await user.click(screen.getByTestId('apply-picker-values'));

    await waitFor(() => {
      expect(getFormState(container).isValid).toBe(true);
    });

    expect(screen.getByRole('button', { name: /^保存$/ })).toBeEnabled();
  });

  it('keeps position coordinates as numbers when edited through NumberField', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { container } = renderManifestCreateForm({
      onSubmit,
      pickerAssignments: manifestPickerAssignments(),
    });

    await user.type(screen.getByLabelText('プロジェクト名'), 'v0');
    await user.click(screen.getByTestId('apply-picker-values'));

    await waitFor(() => {
      expect(getFormState(container).isValid).toBe(true);
    });

    const xInput = screen.getByLabelText('x');
    await user.clear(xInput);
    await user.type(xInput, '3');

    await waitFor(() => {
      expect(getFormState(container).isValid).toBe(true);
    });

    await user.click(screen.getByRole('button', { name: /^保存$/ }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      data: {
        initialState: {
          field: {
            pos: { x: 3, y: 0 },
          },
        },
      },
    });
  });

  it('allows null coordinates in draft when a position input is cleared', async () => {
    const user = userEvent.setup();

    const { container } = renderManifestCreateForm({
      pickerAssignments: manifestPickerAssignments(),
    });

    await user.type(screen.getByLabelText('プロジェクト名'), 'v0');
    await user.click(screen.getByTestId('apply-picker-values'));

    await waitFor(() => {
      expect(getFormState(container).isValid).toBe(true);
    });

    await user.clear(screen.getByLabelText('x'));

    await waitFor(() => {
      expect(getFormState(container).isValid).toBe(true);
    });

    expect(getSaveButton()).toBeEnabled();
  });

  describe('draft mode toggle validation', () => {
    it('keeps the form valid in both draft and ready modes when all required fields are filled', async () => {
      const user = userEvent.setup();
      const { container } = renderManifestCreateForm({
        pickerAssignments: manifestPickerAssignments(),
      });

      await fillManifestProjectName(user);
      await applyManifestPickerValues(user);

      await waitFor(() => {
        expect(getFormState(container).isValid).toBe(true);
      });
      expect(getSaveButton()).toBeEnabled();

      await setManifestSaveMode(user, 'ready');

      await waitFor(() => {
        expect(getFormState(container).isValid).toBe(true);
      });
      expect(getSaveButton()).toBeEnabled();

      await setManifestSaveMode(user, 'draft');

      await waitFor(() => {
        expect(getFormState(container).isValid).toBe(true);
      });
      expect(getSaveButton()).toBeEnabled();
    });

    it('stays valid in draft but becomes invalid in ready when nullable refs are null', async () => {
      const user = userEvent.setup();
      const { container } = renderManifestCreateForm({
        pickerAssignments: manifestPickerAssignments({
          fieldId: null,
          defaultMessagePanel: null,
        }),
      });

      await fillManifestProjectName(user);
      await applyManifestPickerValues(user);

      await waitFor(() => {
        expect(getFormState(container).isValid).toBe(true);
      });
      expect(getSaveButton()).toBeEnabled();

      await setManifestSaveMode(user, 'ready');

      await waitFor(() => {
        expect(getFormState(container).isValid).toBe(false);
      });
      expect(getSaveButton()).toBeDisabled();

      await setManifestSaveMode(user, 'draft');

      await waitFor(() => {
        expect(getFormState(container).isValid).toBe(true);
      });
      expect(getSaveButton()).toBeEnabled();
    });

    it('keeps the form invalid in both draft and ready modes when meta fields fail validation', async () => {
      const user = userEvent.setup();
      const { container } = renderManifestCreateForm({
        pickerAssignments: manifestPickerAssignments(),
      });

      await fillManifestProjectName(user, 'Invalid Name');

      await waitFor(() => {
        expect(getFormState(container).isValid).toBe(false);
      });
      expect(getSaveButton()).toBeDisabled();

      await setManifestSaveMode(user, 'ready');

      await waitFor(() => {
        expect(getFormState(container).isValid).toBe(false);
      });
      expect(getSaveButton()).toBeDisabled();
    });
  });
});
