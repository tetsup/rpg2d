type NumberDefinition = {
  type: 'number';
  min?: number;
  max?: number;
  asInt: boolean;
  optional?: false;
};

type OptionalNumberDefinition = {
  type: 'number';
  min?: number;
  max?: number;
  asInt: boolean;
  optional: true;
};

type StringDefinition = {
  type: 'string';
  min?: number;
  max?: number;
  optional?: false;
};

type OptionalStringDefinition = {
  type: 'string';
  min?: number;
  max?: number;
  optional: true;
};

export type ValueDefinition = NumberDefinition | OptionalNumberDefinition | StringDefinition | OptionalStringDefinition;

export type ValueTypeFromDefinition<T> = T extends OptionalNumberDefinition
  ? number | undefined
  : T extends NumberDefinition
    ? number
    : T extends OptionalStringDefinition
      ? string | undefined
      : T extends StringDefinition
        ? string
        : never;

export type StateFromDefinition<T> = T extends { type: string }
  ? ValueTypeFromDefinition<T>
  : T extends Record<string, any>
    ? { [K in keyof T]: StateFromDefinition<T[K]> }
    : never;

export type StateDefinition = ValueDefinition | { [key: string]: StateDefinition };
