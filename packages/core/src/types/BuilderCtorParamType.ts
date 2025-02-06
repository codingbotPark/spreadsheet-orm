
export type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
type BuilderCtorParamType<T extends CtorType> = Tail<ConstructorParameters<T>>
export default BuilderCtorParamType

// export type BasicCtorParamType = ConstructorParameters<abstract new (...args: any[]) => any>
export type CtorType = abstract new (...args:any) => any