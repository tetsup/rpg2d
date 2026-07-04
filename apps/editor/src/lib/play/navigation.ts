export function playPath(manifestId?: string): string {
  if (!manifestId) return '/play';
  const params = new URLSearchParams({ manifest: manifestId });
  return `/play?${params.toString()}`;
}
