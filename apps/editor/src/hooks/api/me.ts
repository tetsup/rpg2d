import { useQuery, type QueryClient } from '@tanstack/react-query';
import type { UserDocument } from '@sharedTypes/database/collection';
import { fetchGetApi } from '@editor/lib/api/get';

export const meQueryKey = ['me'] as const;

export async function fetchMe(): Promise<UserDocument | null> {
  try {
    return await fetchGetApi('/api/auth/me');
  } catch {
    return null;
  }
}

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
    retry: false,
  });
}

export function invalidateMe(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: meQueryKey });
}
