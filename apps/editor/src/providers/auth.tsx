import { createContext, PropsWithChildren, useContext } from 'react';
import type { UserDocument } from '@sharedTypes/database/collection';
import { useMe } from '@editor/hooks/api/me';

type AuthContextValue = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: UserDocument | null;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const query = useMe();

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
