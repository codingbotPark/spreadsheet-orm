import Schema from "@src/core/DDL/implements/Schema"
import BaseBuilder from "./BaseBuilder"


export interface BasicQueryQueueType{
    sheetName?:string
}

abstract class QueryStore<T extends Schema[], QueueType extends BasicQueryQueueType = BasicQueryQueueType> extends BaseBuilder<T>{
    protected queryQueue:Array<QueueType> = []

}


export default QueryStore