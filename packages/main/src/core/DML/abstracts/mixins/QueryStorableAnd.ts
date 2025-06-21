import Schema from "@src/core/DDL/implements/Schema";
import BuilderCtorParamType, { CtorType } from "@src/types/BuilderCtorParamType";
import { QueryBuilderConfig } from "@src/types/configPicks";
import BaseBuilder from "../BaseBuilder";
import { BasicQueryQueueType } from "../QueryStoreAble";


abstract class QueryStorableAnd
    <T extends Schema[],
    NextBuilderType extends BaseBuilder<T>,
    QueueType extends BasicQueryQueueType = BasicQueryQueueType, 
    CtorParam extends CtorType = CtorType, 
    > extends BaseBuilder<T>{
        
    protected queryQueue:Array<QueueType> = []
    protected abstract createQueryForQueue():QueueType

    private nextBuilderCtor: new (config:QueryBuilderConfig<T>, ...args: BuilderCtorParamType<CtorParam>) => NextBuilderType

    and(...ctorParam:BuilderCtorParamType<CtorParam>):NextBuilderType{
        // console.log(ctorParam)
        this.saveCurrentQueryToQueue()
        console.log("queryQueue", this.queryQueue)
        // console.log("beforeEx", this)
        
        // const Constructor = this.constructor as new (...args: any[]) => this;
        // const instance = new Constructor(this.config, ...ctorParam)
        const instance = new this.nextBuilderCtor(this.config, ...ctorParam)
        instance["queryQueue"] = this.queryQueue // save queryQueue
        // console.log("afterEx", instance)

        return instance
    }

    protected saveCurrentQueryToQueue(){
        this.queryQueue.push(this.createQueryForQueue())
    }

    
    constructor(
        config: QueryBuilderConfig<T>,
        nextBuilderCtor: new (...args:any) => any // 👈 다음 builder 지정
      ) {
        super(config)
        this.nextBuilderCtor = nextBuilderCtor
      }
}

export default QueryStorableAnd