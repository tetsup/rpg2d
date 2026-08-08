import { fetchJson } from './base';

export async function fetchDeleteApi<Res>(path: string): Promise<Res> {
  return fetchJson<Res>(path, {
    method: 'DELETE',
  });
}
