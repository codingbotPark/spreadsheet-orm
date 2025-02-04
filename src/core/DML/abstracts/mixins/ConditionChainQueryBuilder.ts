import applyMixins from "types/mixin";
import AndAble, { BasicQueryQueueType } from "../AndAble";
import ConditionBuilder, { DataWithRowType, ConditionParamTypes } from "../WhereAble";
import BaseBuilder from "../BaseBuilder";
import { BasicCtorParamType } from "types/BuilderCtorParamType";

export interface ConditionQueueType extends ConditionParamTypes, BasicQueryQueueType{}

// mixin class
interface ConditionChainQueryBuilder<CtorParamType extends BasicCtorParamType ,QueryQueueType extends ConditionQueueType = ConditionQueueType> extends AndAble<CtorParamType, QueryQueueType>, ConditionBuilder{}

abstract class ConditionChainQueryBuilder<CtorParamType extends BasicCtorParamType, QueryQueueType extends ConditionQueueType> extends BaseBuilder{
    
    chainConditioning(data:string[][][]):DataWithRowType[][]{
        return data.map((rangeData, idx) => {
            const filterParam = this.queryQueue[idx]
            const indexedRangeData = this.indexingBatchData(rangeData)
            const result = this.conditioning(indexedRangeData, filterParam)
            return result
        })
    }

}
applyMixins(ConditionChainQueryBuilder, [AndAble, ConditionBuilder])

export default ConditionChainQueryBuilder