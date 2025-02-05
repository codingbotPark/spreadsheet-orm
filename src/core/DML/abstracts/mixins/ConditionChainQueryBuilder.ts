import applyMixins from "types/mixin";
import AndAble, { BasicQueryQueueType } from "../AndAble";
import ConditionBuilder, { DataWithRowType, ConditionParamTypes } from "../WhereAble";
import BaseBuilder from "../BaseBuilder";
import { CtorType } from "types/BuilderCtorParamType";
import { sheets_v4 } from "googleapis";

export interface ConditionQueueType extends ConditionParamTypes, BasicQueryQueueType{}

// mixin class
interface ConditionChainQueryBuilder<TypeofClass extends CtorType ,QueryQueueType extends ConditionQueueType = ConditionQueueType> extends AndAble<TypeofClass, QueryQueueType>, ConditionBuilder{}

abstract class ConditionChainQueryBuilder<TypeofClass extends CtorType, QueryQueueType extends ConditionQueueType> extends BaseBuilder{
    
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
        const specifiedRanges = this.queryQueue.map((query) => this.composeRange(query.sheetName as string, this.config.DATA_STARTING_ROW))
        const dataFilters = this.makeDataFilters(specifiedRanges)
        const batchDatas = await this.fetchBatchData(this.config.spreadsheetID, dataFilters)
        const batchValues = this.extractValuesFromMatch(batchDatas)
        const indexedBatchValues = batchValues.map((batchValue) => this.indexingBatchData(batchValue))
        const conditionedBatchValues = indexedBatchValues.map((indexedBatchValue, idx) => this.conditioning(indexedBatchValue, this.queryQueue[idx]))
        return conditionedBatchValues
    }


}
applyMixins(ConditionChainQueryBuilder, [AndAble, ConditionBuilder])

export default ConditionChainQueryBuilder