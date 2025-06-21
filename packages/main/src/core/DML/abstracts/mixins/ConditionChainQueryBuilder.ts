import applyMixins from "@src/types/mixin";
import AndAble, { BasicQueryQueueType } from "../AndAble";
import WhereAble, { DataWithRowType, ConditionParamTypes } from "../WhereAble";
import BaseBuilder from "../BaseBuilder";
import { CtorType } from "@src/types/BuilderCtorParamType";

export interface ConditionQueueType extends ConditionParamTypes, BasicQueryQueueType{}

// mixin class
interface ConditionChainQueryBuilder<CtorParam extends CtorType ,QueryQueueType extends ConditionQueueType = ConditionQueueType> extends AndAble<CtorParam, T>, WhereAble{}

abstract class ConditionChainQueryBuilder<CtorParam extends CtorType, QueryQueueType extends ConditionQueueType> extends BaseBuilder{
    
    protected chainConditioning(data:string[][][]):DataWithRowType[][]{
        return data.map((rangeData, idx) => {
            const filterParam = this.queryQueue[idx]
            const indexedRangeData = this.indexingBatchData(rangeData)
            const result = this.conditioning(indexedRangeData, filterParam)
            return result
        })
    }

    protected async getChainConditionedData():Promise<DataWithRowType[][]>{
        this.saveCurrentQueryToQueue()
        const specifiedRanges = this.queryQueue.map((query) => this.config.sheet.composeRange(query.sheetName as string, this.config.sheet.DATA_STARTING_ROW))
        const dataFilters = this.makeDataFilters(specifiedRanges)
        const batchDatas = await this.fetchBatchData(this.config.spread.ID, dataFilters)
        const batchValues = this.extractValuesFromMatch(batchDatas)
        const indexedBatchValues = batchValues.map((batchValue) => this.indexingBatchData(batchValue))
        const conditionedBatchValues = indexedBatchValues.map((indexedBatchValue, idx) => this.conditioning(indexedBatchValue, this.queryQueue[idx]))
        return conditionedBatchValues
    }


}
applyMixins(ConditionChainQueryBuilder, [AndAble, WhereAble])

export default ConditionChainQueryBuilder