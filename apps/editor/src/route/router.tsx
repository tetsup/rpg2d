import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@editor/lib/require-auth';
import { LoginPage } from './login';
import { HomePage } from './home';
import { NewManifestPage } from './manifest/new';
import { NewNamespacePage } from './namespace/new';
import { EditNamespacePage } from './namespace/edit';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element=<HomePage /> />
          <Route path="/manifest/new" element=<NewManifestPage /> />
          <Route path="/namespace/new" element=<NewNamespacePage /> />
          <Route path="/namespace/:id" element=<EditNamespacePage /> />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
