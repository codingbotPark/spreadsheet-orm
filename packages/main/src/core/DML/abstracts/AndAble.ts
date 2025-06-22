import Schema from "@src/core/DDL/implements/Schema";
import BaseBuilder from "./BaseBuilder";
import BuilderCtorParamType, { BuilderConstructor, ExtractConstructor } from "@src/types/BuilderCtorTypes";
import { QueryBuilderConfig } from "@src/types/configPicks";


// abstract class AndAble<CtorParam extends CtorType, T extends Schema[] = Schema[]> extends BaseBuilder<T>{
abstract class AndAble<
T extends Schema[], 
NextClass extends BaseBuilder<T>> 
extends BaseBuilder<T>{

    protected makeNextInstance(...ctorParam:BuilderCtorParamType<ExtractConstructor<NextClass>>):NextClass{
        const Constructor = this.nextClass.constructor as ExtractConstructor<NextClass>
        const instance = new Constructor(this.config, ...ctorParam) as NextClass
        return instance
    }

    protected abstract inheritState(target:NextClass):void
    and(...ctorParam:BuilderCtorParamType<ExtractConstructor<NextClass>>):NextClass{
        // const Constructor = this.constructor as new (...args: any[]) => this;
        // const instance = new Constructor(this.config, ...ctorParam)
        const instance = this.makeNextInstance(...ctorParam)
        this.inheritState(instance)
        return instance
    }

    constructor(config:QueryBuilderConfig<T>, private nextClass:NextClass){
        super(config)
    }
}

export default AndAble

