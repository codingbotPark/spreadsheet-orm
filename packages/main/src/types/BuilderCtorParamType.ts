import Schema from "@src/core/DDL/implements/Schema";
import BaseBuilder from "@src/core/DML/abstracts/BaseBuilder";
import { QueryBuilderConfig } from "./configPicks";

export type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
type BuilderCtorParamType<T extends CtorType> = Tail<ConstructorParameters<T>> // remove first param(config)
export default BuilderCtorParamType

// type CtorType = ConstructorParameters<abstract new (...args: any[]) => any>
export type CtorType<T = any> = abstract new (...args: any[]) => T

export type BuilderConstructor<T extends Schema[], ReturnClass extends BaseBuilder<T>> = 
new (config: QueryBuilderConfig<T>, ...args: any[]) => ReturnClass;