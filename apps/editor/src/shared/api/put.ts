import { fetchJson } from './base';

export async function fetchPutApi<Req, Res>(path: string, body: Req): Promise<Res> {
  return fetchJson<Res>(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
