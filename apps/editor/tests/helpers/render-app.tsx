import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@editor/providers/theme';
import { AuthProvider } from '@editor/providers/auth';
import { RequireAuth } from '@editor/lib/require-auth';
import { NewNamespacePage } from '@editor/route/namespace/new';
import { EditNamespacePage } from '@editor/route/namespace/edit';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

type RenderEditorRoutesOptions = Omit<RenderOptions, 'wrapper'> & {
  initialEntry?: string;
};

export function renderEditorRoutes({ initialEntry = '/', ...options }: RenderEditorRoutesOptions = {}) {
  const queryClient = createTestQueryClient();

  return render(<RoutesStub />, {
    ...options,
    wrapper: () => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
              <Routes>
                <Route element={<RequireAuth />}>
                  <Route path="/namespace/new" element={<NewNamespacePage />} />
                  <Route path="/namespace/:id" element={<EditNamespacePage />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  });
}

function RoutesStub() {
  return null;
}

export function renderEditor(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = createTestQueryClient();

  return render(ui, {
    ...options,
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  });
}
