import z from 'zod';

export const SingleLineSchema = z.string().regex(/^[^\r\n]*$/, '改行は使用できません');
