export type KeysWithValuesOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Require<T, K extends keyof T> = Omit<T,K> & Required<Pick<T,K>>

export type UnwrapPromise<T> = T extends Promise<infer X> ? X : never