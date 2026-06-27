export type KeysContainingString<T> = {
  [K in keyof T]: Extract<T[K], string> extends never ? never : K;
}[keyof T];

export type KeysContainingNumber<T> = {
  [K in keyof T]: Extract<T[K], number> extends never ? never : K;
}[keyof T];

export type KeysContainingDate<T> = {
  [K in keyof T]: Extract<T[K], Date> extends never ? never : K;
}[keyof T];
