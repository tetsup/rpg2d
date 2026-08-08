import { createContext, PropsWithChildren, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UserDocument } from '@sharedTypes/database/collection';
import { queryClient } from '@editor/stores/query-client';
import { fetchGetApi } from '../api/get';

type AuthContextValue = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: UserDocument | null;
  refetch: () => void;
  invalidate: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useMe() {
  return useQuery<UserDocument | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await fetchGetApi('/api/auth/me');
      } catch {
        return null;
      }
    },
    retry: false,
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const query = useMe();
  const value: AuthContextValue = {
    status: query.isPending ? 'loading' : query.data ? 'authenticated' : 'unauthenticated',
    user: query.data ?? null,
    refetch: () => {
      query.refetch();
    },
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
