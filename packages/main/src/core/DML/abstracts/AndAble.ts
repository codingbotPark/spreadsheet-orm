import Schema from "@src/core/DDL/implements/Schema";
import BaseBuilder from "./BaseBuilder";
import BuilderCtorParamType, { BuilderConstructor, ExtractConstructor } from "@src/types/BuilderCtorTypes";
import { QueryBuilderConfig } from "@src/types/configPicks";


// abstract class AndAble<CtorParam extends CtorType, T extends Schema[] = Schema[]> extends BaseBuilder<T>{
abstract class AndAble<
T extends Schema[],
NextClassInstance extends BaseBuilder<T>
>
extends BaseBuilder<T>{
    protected abstract nextClassConstructor:BuilderConstructor<T, NextClassInstance>

    protected makeNextInstance(...ctorParam:BuilderCtorParamType<ExtractConstructor<NextClassInstance>>):NextClassInstance{
        const Constructor = this.nextClassConstructor as BuilderConstructor<T, NextClassInstance>
        const instance = new Constructor(this.config, ...ctorParam) as NextClassInstance
        return instance
    }

    protected abstract inheritState(target:NextClassInstance):void
    and(...ctorParam:BuilderCtorParamType<ExtractConstructor<NextClassInstance>>):NextClassInstance{
        console.log("레거시and")
        const instance = this.makeNextInstance(...ctorParam)
        this.inheritState(instance)
        return instance
    }

    constructor(config:QueryBuilderConfig<T>){
        super(config)
    }
}

export default AndAble

// export type BuilderConstructor<T extends Schema[], ReturnClass extends BaseBuilder<T>> = 
// new (config: QueryBuilderConfig<T>, ...args: any[]) => ReturnClass;
