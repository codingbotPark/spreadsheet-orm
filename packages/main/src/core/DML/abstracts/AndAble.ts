import Schema from "@src/core/DDL/implements/Schema";
import BaseBuilder from "./BaseBuilder";
import BuilderCtorParamType from "@src/types/BuilderCtorParamType";
import { QueryBuilderConfig } from "@src/types/configPicks";


// abstract class AndAble<CtorParam extends CtorType, T extends Schema[] = Schema[]> extends BaseBuilder<T>{
abstract class AndAble<
T extends Schema[], 
ReturnClass extends BaseBuilder<T>, 
RCtor extends new (config: QueryBuilderConfig<T>, ...args: any[]) => ReturnClass> 
extends BaseBuilder<T>{
    
    and(...ctorParam:BuilderCtorParamType<RCtor>):ReturnClass{
        const Constructor = this.returnClass.constructor as new (...args: any[]) => ReturnClass;
        const instance = new Constructor(this.config, ...ctorParam)
        return instance
    }

    constructor(config:QueryBuilderConfig<T>, private returnClass:ReturnClass){
        super(config)
    }
}

export default AndAble

