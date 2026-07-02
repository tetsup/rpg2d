import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderEditor } from '../helpers/render-app';
import { NewGraphicsResourcePage } from '@editor/route/graphics/new';

function renderGraphicsNew(initialEntry: string) {
  return renderEditor(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/resources/:type/new" element={<NewGraphicsResourcePage />} />
        <Route path="/resources" element={<div>resources home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('graphics resource create page', () => {
  it('renders the mobile editor shell for image type', async () => {
    renderGraphicsNew('/resources/image/new');

    await waitFor(() => {
      expect(screen.getByRole('toolbar', { name: '描画ツール' })).toBeInTheDocument();
    });

    expect(screen.getByText('＋ボタンから画像を追加してください')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '画像' })).toBeInTheDocument();
    expect(screen.getByLabelText('パレット')).toBeInTheDocument();
  });

  it('redirects unsupported resource types to /resources', async () => {
    renderGraphicsNew('/resources/tile/new');

    await waitFor(() => {
      expect(screen.getByText('resources home')).toBeInTheDocument();
    });
  });
});
