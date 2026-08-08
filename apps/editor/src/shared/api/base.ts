import { ApiError } from './error';

export async function runAsync<T>(task: () => Promise<T>, context: string): Promise<T> {
  try {
    return await task();
  } catch (err) {
    throw new Error(`${context} error: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, credentials: 'include' });

  if (!response.ok) {
    const body = await response.json();
    throw new ApiError(response.status, body);
  }

  return (await response.json()) as T;
}
