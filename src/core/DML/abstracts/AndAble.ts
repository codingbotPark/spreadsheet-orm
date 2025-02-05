import SpreadsheetConfig from "config/SpreadsheetConfig";
import BaseBuilder from "./BaseBuilder";
import BuilderCtorParamType, { CtorType } from "types/BuilderCtorParamType";

export interface BasicQueryQueueType{
    sheetName?:string
}

// implement "and" method
// abstract class ChainQueryBuilder<CtorParam extends new (...args: any) => any, QueueType extends BasicQueryQueueType = BasicQueryQueueType> extends BaseBuilder{
abstract class AndAble<CtorParam extends CtorType, QueueType extends BasicQueryQueueType = BasicQueryQueueType> extends BaseBuilder{
    protected abstract queryQueue:Array<QueueType>

    protected abstract createQueryForQueue():QueueType

    and(...ctorParam:BuilderCtorParamType<CtorParam>):this{
        // console.log(ctorParam)
        this.saveCurrentQueryToQueue()
        console.log("queryQueue", this.queryQueue)
        // console.log("beforeEx", this)
        const Constructor = this.constructor as new (...args: any[]) => this;
        const instance = new Constructor(this.config, ...ctorParam)
        instance["queryQueue"] = this.queryQueue // save queryQueue
        instance["sheetName"] = this.sheetName // save sheetName
        // console.log("afterEx", instance)

        return instance
    }

    protected saveCurrentQueryToQueue(){
        this.queryQueue.push(this.createQueryForQueue())
    }
}

export default AndAble

