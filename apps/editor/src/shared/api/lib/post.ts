import { fetchJson } from './common';

export async function fetchPostApi<Req, Res>(path: string, body: Req): Promise<Res> {
  return fetchJson<Res>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
