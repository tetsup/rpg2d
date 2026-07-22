import z from 'zod';
import { BTreeDateOps, BTreeNumberOps, BTreeStringOps, FullTextOps, JsonOps, TrgmOps } from './operator';
import { DateValue, NumberValue, StringValue } from './variable';

export function createBTreeStringFilterSchema<const T extends string>(name: T) {
  return z.object({
    name: z.literal(name),
    op: BTreeStringOps,
    value: StringValue,
  });
}

export function createBTreeNumberFilterSchema<const T extends string>(name: T) {
  return z.object({
    name: z.literal(name),
    op: BTreeNumberOps,
    value: NumberValue,
  });
}

export function createBTreeDateFilterSchema<const T extends string>(name: T) {
  return z.object({
    name: z.literal(name),
    op: BTreeDateOps,
    value: DateValue,
  });
}

export function createTrgmStringFilterSchema<const T extends string>(name: T) {
  return z.object({
    name: z.literal(name),
    op: TrgmOps,
    value: StringValue,
  });
}

export function createJsonFilterSchema<const T extends string>(name: T) {
  return z.object({
    name: z.literal(name),
    op: JsonOps,
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.any())]),
  });
}

export function createFullTextFilterSchema<const T extends string>(name: T) {
  return z.object({
    name: z.literal(name),
    op: FullTextOps,
    value: StringValue,
  });
}
