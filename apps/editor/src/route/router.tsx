import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './home';
import { NewManifestPage } from './manifest/new';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element=<HomePage /> />
        <Route path="/manifest/new" element=<NewManifestPage /> />
      </Routes>
    </BrowserRouter>
  );
}
