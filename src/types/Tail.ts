type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
export default Tail

export type BasicCtorParamType = ConstructorParameters<abstract new (...args: any[]) => any>