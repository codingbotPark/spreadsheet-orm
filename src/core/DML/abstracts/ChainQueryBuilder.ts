import SpreadsheetConfig from "config/SpreadsheetConfig";
import BaseBuilder from "./BaseBuilder";
import { BasicCtorParamType } from "types/Tail";

export interface BasicQueryQueueType{
    sheetName?:string
}

// implement "and" method
// abstract class ChainQueryBuilder<CtorParam extends new (...args: any) => any, QueueType extends BasicQueryQueueType = BasicQueryQueueType> extends BaseBuilder{
abstract class ChainQueryBuilder<CtorParam extends BasicCtorParamType, QueueType extends BasicQueryQueueType = BasicQueryQueueType> extends BaseBuilder{
    protected abstract queryQueue:Array<QueueType>

    protected abstract createQueryForQueue():QueueType

    and(...ctorParam:CtorParam):this{
        // if param==null -> use same sheetName
        
        this.addQueryToQueue(this.createQueryForQueue())
        return this
    }

    protected addQueryToQueue(query:QueueType){
        this.queryQueue.push(query)
    }
}

export default ChainQueryBuilder

