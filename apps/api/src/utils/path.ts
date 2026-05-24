export function pathToId(filePath: string) {
  return filePath
    .split('/')
    .at(-1)
    ?.replace(/\.(yaml|dt3)$/, '');
}
