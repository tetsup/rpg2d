import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/login';
import { HomePage } from './pages/home';
import { ResourceTypeSelectPage } from './pages/resource';
import { NewManifestPage } from './pages/resource/manifest/new';
import { NewImagePage } from './pages/resource/image/new';
import { EditImagePage } from './pages/resource/image/edit';
import { ResourceSearchPage } from './pages/resource/search';
import { PlayPage } from './pages/play';
import { NewNamespacePage } from './pages/namespace/new';
import { EditNamespacePage } from './pages/namespace/edit';
import { RequireAuth } from './require-auth';

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
          <Route path="/resources/:namespace/image/:name" element={<EditImagePage />} />
          <Route path="/resources/:type" element={<ResourceSearchPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/namespaces/new" element={<NewNamespacePage />} />
          <Route path="/namespaces/:id" element={<EditNamespacePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
