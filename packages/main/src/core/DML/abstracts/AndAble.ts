import Schema from "@src/core/DDL/implements/Schema";
import BaseBuilder from "./BaseBuilder";
import BuilderCtorParamType, { BuilderConstructor, CtorType } from "@src/types/BuilderCtorParamType";
import { QueryBuilderConfig } from "@src/types/configPicks";


// abstract class AndAble<CtorParam extends CtorType, T extends Schema[] = Schema[]> extends BaseBuilder<T>{
abstract class AndAble<
T extends Schema[], 
NextClass extends BaseBuilder<T>, 
ReturnCtor extends BuilderConstructor<T, NextClass>> 
extends BaseBuilder<T>{

    protected makeNextInstance(...ctorParam:BuilderCtorParamType<ReturnCtor>):NextClass{
        const Constructor = this.nextClass.constructor as ReturnCtor
        const instance = new Constructor(this.config, ...ctorParam)
        return instance
    }

    protected abstract inheritState(target:NextClass):void
    
    and(...ctorParam:BuilderCtorParamType<ReturnCtor>):NextClass{
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

