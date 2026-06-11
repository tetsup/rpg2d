import { fetchJson } from './common';

export async function fetchDeleteApi<Res>(path: string): Promise<Res> {
  return fetchJson<Res>(path, {
    method: 'DELETE',
  });
}
