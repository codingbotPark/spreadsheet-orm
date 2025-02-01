import SpreadsheetConfig from "config/SpreadsheetConfig";
import BaseBuilder from "./BaseBuilder";

export interface BasicQueryQueueType{
    sheetName?:string
}

// implement "and" method
abstract class ChainQueryBuilder<QueueType extends BasicQueryQueueType = BasicQueryQueueType> extends BaseBuilder{
    protected abstract queryQueue:Array<QueueType>

    constructor(config:SpreadsheetConfig){
        super(config)
    }

    protected abstract createQueryForQueue():QueueType

    and(sheetName?:string):this{
        // if param==null -> use same sheetName
        if (sheetName){
            this.sheetName = sheetName
        }
        
        this.addQueryToQueue(this.createQueryForQueue())
        return this
    }

    protected addQueryToQueue(query:QueueType){
        this.queryQueue.push(query)
    }
}

export default ChainQueryBuilder