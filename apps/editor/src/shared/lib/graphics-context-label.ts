/** Display label for a resource name segment (index or direction). */
export function getResourceContextLabel(name: string): string {
  const hyphen = name.lastIndexOf('-');
  if (hyphen >= 0) {
    return name.slice(hyphen + 1);
  }

  const dot = name.lastIndexOf('.');
  if (dot >= 0) {
    return name.slice(dot + 1);
  }

  return name;
}
