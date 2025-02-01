import applyMixins from "interface/mixin";
import ChainQueryBuilder, { BasicQueryQueueType } from "../ChainQueryBuilder";
import ConditionBuilder, { DataWithRowType, ConditionParamTypes } from "../WhereAble";
import BaseBuilder from "../BaseBuilder";

export interface ConditionQueueType extends ConditionParamTypes, BasicQueryQueueType{}

// mixin class
interface ConditionChainQueryBuilder<QueryQueueType extends ConditionQueueType = ConditionQueueType> extends ChainQueryBuilder<QueryQueueType>, ConditionBuilder{}

abstract class ConditionChainQueryBuilder extends BaseBuilder{
    
    chainConditioning(data:string[][][]):DataWithRowType[][]{
        return data.map((rangeData, idx) => {
            const filterParam = this.queryQueue[idx]
            const indexedRangeData = this.indexingBatchData(rangeData)
            const result = this.conditioning(indexedRangeData, filterParam)
            return result
        })
    }

}
applyMixins(ConditionChainQueryBuilder, [ChainQueryBuilder, ConditionBuilder])

export default ConditionChainQueryBuilder