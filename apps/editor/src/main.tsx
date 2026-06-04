import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './providers/theme';
import { queryClient } from './lib/query-client';
import { AppRouter } from './route/router';
import '../index.css';

if (import.meta.env.DEV) {
  import('eruda').then(({ default: eruda }) => {
    eruda.init();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
