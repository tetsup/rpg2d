export async function runAsync<T>(task: () => Promise<T>, context: string): Promise<T> {
  try {
    return await task();
  } catch (err) {
    throw new Error(`${context} error: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}
