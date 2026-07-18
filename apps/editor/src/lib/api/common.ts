import { ApiError } from './error';

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, credentials: 'include' });

  if (!response.ok) {
    const body = await response.json();
    throw new ApiError(response.status, body);
  }

  return (await response.json()) as T;
}
