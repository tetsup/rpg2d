import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import z from 'zod';
import { ja } from 'zod/locales';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import '@editor/i18n/config';
import { ThemeProvider } from './shared/providers/theme';
import { AlertProvider } from './shared/providers/alert';
import { AuthProvider } from './shared/providers/auth';
import { queryClient } from './stores/query-client';
import { AppRouter } from './app/router';
import './styles/index.css';

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
        <AlertProvider>
          <Toaster />
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </AlertProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
