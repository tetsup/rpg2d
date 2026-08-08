import { fetchJson, runAsync } from './base';

type QueryParams = Record<string, string | undefined>;

export async function fetchGetApi<Req extends QueryParams, Res>(path: string, params?: Req): Promise<Res> {
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, value);
    }
  }

  const url = searchParams.toString() ? `${path}?${searchParams.toString()}` : path;

  return runAsync(() => fetchJson<Res>(url), `GET ${path}`);
}
