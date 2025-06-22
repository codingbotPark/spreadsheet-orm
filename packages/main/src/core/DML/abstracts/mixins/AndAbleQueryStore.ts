import Schema from "@src/core/DDL/implements/Schema";
import BuilderCtorParamType, { BuilderConstructor, ExtractConstructor } from "@src/types/BuilderCtorTypes";
import { QueryBuilderConfig } from "@src/types/configPicks";
import BaseBuilder from "../BaseBuilder";
import QueryStore, { BasicQueryQueueType } from "../QueryStore";
import applyMixins from "@src/types/mixin";
import AndAble from "../AndAble";
import WhereAble from "../WhereAble";

interface AndAbleQueryStore
<T extends Schema[],
NextClass extends QueryStore<T, QueryQueueType>,
QueryQueueType extends BasicQueryQueueType
> extends AndAble<T, NextClass>, QueryStore<T, QueryQueueType>{}

abstract class AndAbleQueryStore
    <T extends Schema[],
    NextClass extends QueryStore<T, QueryQueueType>,
    QueryQueueType extends BasicQueryQueueType,
    > extends BaseBuilder<T>{
        
    protected queryQueue:Array<QueryQueueType> = []
    protected abstract createQueryForQueue():QueryQueueType

    protected inheritState(target:NextClass){
      target['sheetName'] = this.sheetName
      target['queryQueue'] = this.queryQueue
    }
    
    and(...ctorParam:BuilderCtorParamType<ExtractConstructor<NextClass>>):NextClass{
        this.saveCurrentQueryToQueue()
        const instance = this.makeNextInstance(...ctorParam)
        this.inheritState(instance)
        return instance
    }

    protected saveCurrentQueryToQueue(){
        this.queryQueue.push(this.createQueryForQueue())
    }

    
    constructor(
        config: QueryBuilderConfig<T>,
      ) {
        super(config)
      }
}
applyMixins(AndAbleQueryStore, [AndAble, QueryStore])

export default AndAbleQueryStore