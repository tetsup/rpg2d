import { createContext, PropsWithChildren, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGetApi } from '@editor/lib/api/get';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: AuthUser | null;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<AuthUser | null> {
  try {
    return await fetchGetApi('/api/auth/me');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const query = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const value: AuthContextValue = {
    status: query.isPending ? 'loading' : query.data ? 'authenticated' : 'unauthenticated',
    user: query.data ?? null,
    refetch: () => {
      void query.refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
