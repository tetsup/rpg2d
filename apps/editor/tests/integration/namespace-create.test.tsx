import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderEditorRoutes } from '../helpers/render-app';
import { server } from '../helpers/server';

describe('namespace create', () => {
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
          isPrivate: false,
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

    const saveButton = screen.getByRole('button', { name: /保存/ });

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await user.click(saveButton);

    await waitFor(() => {
      expect(postedBody).toEqual({
        id: 'testgroup',
        presenceName: 'Test Group',
        description: 'A test namespace',
        isPrivate: false,
      });
    });

    await waitFor(() => {
      expect(screen.getByLabelText('ID')).toBeDisabled();
      expect(screen.getByLabelText('ID')).toHaveValue('testgroup');
    });
  });
});
