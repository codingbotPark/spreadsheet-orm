import BaseBuilder from "./BaseBuilder";

// implement "and" method
abstract class ChainQueryBuilder<QueueType, ExecuteReturn = void> extends BaseBuilder<ExecuteReturn>{
    private currentQueryIndex = 0
    protected queryQueue:Array<QueueType> = []

    abstract createQueryForQueue():QueueType

    and(sheetName:string | null):this{
        // if param==null -> use same sheetName
        if (!!sheetName){
            this.sheetName = sheetName
        }

        this.queryQueue[this.currentQueryIndex] = this.createQueryForQueue()
        this.currentQueryIndex += 1
        return this
    }
}

export default ChainQueryBuilder