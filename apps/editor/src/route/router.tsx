import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './home';
import { NewManifestPage } from './manifest/new';
import { NewNamespacePage } from './namespace/new';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element=<HomePage /> />
        <Route path="/manifest/new" element=<NewManifestPage /> />
        <Route path="/namespace/new" element=<NewNamespacePage /> />
      </Routes>
    </BrowserRouter>
  );
}
