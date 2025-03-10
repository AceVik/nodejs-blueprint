
export type KeyValueAdapter<TKey, TValue> = {
  get(key: TKey): TValue | undefined;
  set(key: TKey, value: TValue): void;
  has(key: TKey): boolean;
};

export type KeyValueAdapterBuilder<TTarget, TKey, TValue> = (target: TTarget) => KeyValueAdapter<TKey, TValue>;