import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderEditorRoutes } from '../helpers/render-app';
import { server } from '../helpers/server';

describe('namespace create', () => {
  it('associates the isPrivate switch with its label and toggles via label click', async () => {
    const user = userEvent.setup();
    renderEditorRoutes({ initialEntry: '/namespace/new' });

    await waitFor(() => {
      expect(screen.getByLabelText('非公開')).toBeInTheDocument();
    });

    const isPrivateSwitch = screen.getByRole('switch', { name: '非公開' });

    expect(isPrivateSwitch).toHaveAttribute('id', 'field--isPrivate');
    expect(isPrivateSwitch).not.toBeChecked();

    await user.click(screen.getByText('非公開'));

    expect(isPrivateSwitch).toBeChecked();

    await user.click(screen.getByText('非公開'));

    expect(isPrivateSwitch).not.toBeChecked();
  });

  it('toggles via clicking the switch track', async () => {
    const user = userEvent.setup();
    renderEditorRoutes({ initialEntry: '/namespace/new' });

    await waitFor(() => {
      expect(screen.getByLabelText('非公開')).toBeInTheDocument();
    });

    const isPrivateSwitch = screen.getByRole('switch', { name: '非公開' });

    expect(isPrivateSwitch).not.toBeChecked();

    await user.click(isPrivateSwitch.parentElement!);

    expect(isPrivateSwitch).toBeChecked();

    await user.click(isPrivateSwitch.parentElement!);

    expect(isPrivateSwitch).not.toBeChecked();
  });

  it('fills the form, posts to the API, and navigates to the edit page', async () => {
    let postedBody: unknown;

    server.use(
      http.post('/api/namespaces', async ({ request }) => {
        postedBody = await request.json();
        return HttpResponse.json({});
      }),
      http.get('/api/namespaces/testgroup', () =>
        HttpResponse.json({
          id: 'testgroup',
          presenceName: 'Test Group',
          description: 'A test namespace',
          isPrivate: true,
        })
      )
    );

    const user = userEvent.setup();
    renderEditorRoutes({ initialEntry: '/namespace/new' });

    await waitFor(() => {
      expect(screen.getByLabelText('ID')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('ID'), 'testgroup');
    await user.type(screen.getByLabelText('グループ名'), 'Test Group');
    await user.type(screen.getByLabelText('グループの説明'), 'A test namespace');
    await user.click(screen.getByLabelText('非公開'));

    const saveButton = screen.getByRole('button', { name: /^保存$/ });

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await user.click(saveButton);

    await waitFor(() => {
      expect(postedBody).toEqual({
        id: 'testgroup',
        presenceName: 'Test Group',
        description: 'A test namespace',
        isPrivate: true,
      });
    });

    await waitFor(() => {
      expect(screen.getByLabelText('ID')).toBeDisabled();
      expect(screen.getByLabelText('ID')).toHaveValue('testgroup');
      expect(screen.getByRole('switch', { name: '非公開' })).toBeChecked();
    });
  });
});
