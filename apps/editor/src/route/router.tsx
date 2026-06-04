import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageLayout } from '@editor/components/features/layout/page-layout';
import { HomePage } from './home';

export function AppRouter() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element=<HomePage /> />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}
