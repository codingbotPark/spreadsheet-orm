import Schema from "@src/core/DDL/implements/Schema"
import BaseBuilder from "./BaseBuilder"


export interface BasicQueryQueueType{
    sheetName?:string
}

abstract class QueryStoreAble<QueueType extends BasicQueryQueueType = BasicQueryQueueType, T extends Schema[] = Schema[]> extends BaseBuilder<T>{
    protected queryQueue:Array<QueueType> = []
    protected abstract createQueryForQueue():QueueType
    // instance["queryQueue"] = this.queryQueue // save queryQueue

    protected saveCurrentQueryToQueue(){
        this.queryQueue.push(this.createQueryForQueue())
    }
}


export default QueryStoreAble