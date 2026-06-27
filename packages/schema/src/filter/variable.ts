import z from 'zod';

export const StringValue = z.string();
export const NumberValue = z.number();
export const BoolValue = z.boolean();
export const StringArrayValue = z.array(z.string());
export const DateValue = z.coerce.date();
