import z from 'zod';
import { HttpError, ParseError } from './error';

export async function fetchWithThrow<T>(
  req: RequestInfo,
  parser: (res: Response) => Promise<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(req, init);
  if (!res.ok) {
    throw new HttpError(res.status, await res.text());
  }
  const body = await parser(res);
  return body;
}

async function parseJson(res: Response) {
  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch (e) {
    return new ParseError(raw);
  }
}

export async function fetchJson<T>(req: RequestInfo, schema: z.ZodType<T>, init?: RequestInit) {
  const parser = async (res: Response) => {
    const obj = await parseJson(res);
    const parsed = await schema.parseAsync(obj);
    return parsed;
  };
  return await fetchWithThrow(req, parser, init);
}

export async function fetchBlob(req: RequestInfo, init?: RequestInit) {
  const parser = async (res: Response) => {
    return await res.blob();
  };
  return await fetchWithThrow(req, parser, init);
}
