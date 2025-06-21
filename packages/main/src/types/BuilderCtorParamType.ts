import BaseBuilder from "@src/core/DML/abstracts/BaseBuilder";

export type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
type BuilderCtorParamType<T extends CtorType> = Tail<ConstructorParameters<T>> // remove first param(config)
export default BuilderCtorParamType

// type CtorType = ConstructorParameters<abstract new (...args: any[]) => any>
type CtorType<T = any> = abstract new (...args: any[]) => T