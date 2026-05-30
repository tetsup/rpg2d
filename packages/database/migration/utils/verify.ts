export const hasIndex = (
  indexes: { key: Record<string, unknown>; unique?: boolean }[],
  key: Record<string, 1 | -1>,
  options?: {
    unique?: boolean;
  }
) => {
  return indexes.some(
    (index) =>
      JSON.stringify(index.key) === JSON.stringify(key) &&
      (options?.unique === undefined || index.unique === options.unique)
  );
};
