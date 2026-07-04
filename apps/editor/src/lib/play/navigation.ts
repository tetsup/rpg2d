export function playPath(manifestId?: string, options?: { pick?: boolean }): string {
  const params = new URLSearchParams();
  if (manifestId) {
    params.set('manifest', manifestId);
  }
  if (options?.pick) {
    params.set('pick', '1');
  }
  const query = params.toString();
  return query ? `/play?${query}` : '/play';
}
