export async function fetchGetApi<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value);
      }
    });
  }
  const response = await fetch(`${path}?${searchParams}`);
  if (!response.ok) {
    throw new Error(`GET ${path} failed`);
  }
  return response.json();
}
