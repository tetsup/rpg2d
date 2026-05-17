import z from 'zod';
import { BadRequestError } from '../errors/http-error';

export const parseParams = <T extends z.ZodSchema>(schema: T, input: unknown) => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new BadRequestError(result.error.message);
  }
  return result.data;
};
