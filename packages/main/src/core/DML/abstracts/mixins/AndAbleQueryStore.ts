import Schema from "@src/core/DDL/implements/Schema";
import { BuilderConstructor } from "@src/types/BuilderCtorTypes";
import { QueryBuilderConfig } from "@src/types/configPicks";
import BaseBuilder from "../BaseBuilder";
import QueryStore, { BasicQueryQueueType } from "../QueryStore";
import applyMixins from "@src/types/mixin";
import AndAble from "../AndAble";

interface AndAbleQueryStore
<T extends Schema[],
NextClassInstance extends QueryStore<T, QueryQueueType>,
QueryQueueType extends BasicQueryQueueType
> extends AndAble<T, NextClassInstance>, QueryStore<T, QueryQueueType>{}

abstract class AndAbleQueryStore
    <T extends Schema[],
    NextClassInstance extends QueryStore<T, QueryQueueType>,
    QueryQueueType extends BasicQueryQueueType,
    > extends BaseBuilder<T>{
    
    protected abstract createQueryForQueue():QueryQueueType

    protected inheritState(target:NextClassInstance){
      target['sheetName'] = this.sheetName
      target['queryQueue'] = this.queryQueue
      console.log("inherit", this.queryQueue)
    }
    
    protected saveCurrentQueryToQueue(){
        this.queryQueue.push(this.createQueryForQueue())
    }
    
    constructor(
        config: QueryBuilderConfig<T>,
        protected nextClassConstructor:BuilderConstructor<T, NextClassInstance>,
      ) {
        console.log("constructor는 요기")
        super(config)
      }
}
applyMixins(AndAbleQueryStore, [AndAble, QueryStore])

export default AndAbleQueryStore