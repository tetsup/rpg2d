import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@editor/lib/require-auth';
import { LoginPage } from './login';
import { HomePage } from './home';
import { NewManifestPage } from './manifest/new';
import { NewNamespacePage } from './namespace/new';
import { EditNamespacePage } from './namespace/edit';
import { ResourceTypeSelectPage } from './resources/index';
import { ResourceSearchPage } from './resources/search';
import { NewResourceByNamespacePage } from './resource/new-by-namespace';
import { NewResourceNamespacePage } from './resource/new-namespace';
import { EditResourcePage } from './resource/edit';
import { PlayPage } from './play';
import { NewImagePage } from './resource/image/new';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<ResourceTypeSelectPage />} />
          <Route path="/resources/manifest/new" element={<NewManifestPage />} />
          <Route path="/resources/image/new" element={<NewImagePage />} />
          <Route path="/resources/image/:id" element={<NewImagePage />} />
          <Route path="/resources/:type" element={<ResourceSearchPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/namespaces/new" element={<NewNamespacePage />} />
          <Route path="/namespaces/:id" element={<EditNamespacePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
