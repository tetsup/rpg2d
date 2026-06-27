export function getDatabaseSchema(): string | undefined {
  const value = process.env.DATABASE_SCHEMA?.trim();
  return value || undefined;
}

export function getPoolOptions(): { options?: string } {
  const schema = getDatabaseSchema();
  if (!schema) {
    return {};
  }

  return { options: `-c search_path=${schema},public` };
}
