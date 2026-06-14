import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import z from 'zod';
import { ja } from 'zod/locales';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './providers/theme';
import { AuthProvider } from './providers/auth';
import { queryClient } from './lib/query-client';
import { AppRouter } from './route/router';
import { Toaster } from './components/ui/sonner';
import '../index.css';

if (import.meta.env.DEV) {
  import('eruda').then(({ default: eruda }) => {
    eruda.init();
  });
}

z.config(ja());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
