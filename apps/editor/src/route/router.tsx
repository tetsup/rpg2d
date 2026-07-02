import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@editor/lib/require-auth';
import { LoginPage } from './login';
import { HomePage } from './home';
import { NewManifestPage } from './manifest/new';
import { NewNamespacePage } from './namespace/new';
import { EditNamespacePage } from './namespace/edit';
import { ResourceTypeSelectPage } from './resources/index';
import { ResourceSearchPage } from './resources/search';
import { NewGraphicsResourcePage } from './graphics/new';
import { NewGraphicsResourceNamespacePage } from './graphics/new-namespace';
import { EditGraphicsResourcePage } from './graphics/edit';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<ResourceTypeSelectPage />} />
          <Route path="/resources/manifest/new" element={<NewManifestPage />} />
          <Route path="/resources/:namespace/:type/new" element={<NewGraphicsResourcePage />} />
          <Route path="/resources/:type/new" element={<NewGraphicsResourceNamespacePage />} />
          <Route path="/resources/:namespace/:type/:name" element={<EditGraphicsResourcePage />} />
          <Route path="/resources/:type" element={<ResourceSearchPage />} />
          <Route path="/namespaces/new" element={<NewNamespacePage />} />
          <Route path="/namespaces/:id" element={<EditNamespacePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
