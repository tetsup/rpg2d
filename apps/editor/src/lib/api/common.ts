import { ApiError } from './error';

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, credentials: 'include' });

  if (!response.ok) {
    throw new ApiError(response, response.body);
  }

  return (await response.json()) as T;
}
