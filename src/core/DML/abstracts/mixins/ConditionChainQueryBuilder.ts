import applyMixins from "interface/mixin";
import ChainQueryBuilder, { BasicQueryQueueType } from "../ChainQueryBuilder";
import ConditionBuilder, { ConditionedDataWithIdx, ConditionParamTypes } from "../ConditionBuilder";
import BaseBuilder from "../BaseBuilder";

export interface ConditionQueueType extends ConditionParamTypes, BasicQueryQueueType{}

// mixin class
interface ConditionChainQueryBuilder<ExecuteReturn, QueryQueueType extends ConditionQueueType = ConditionQueueType> extends ChainQueryBuilder<ExecuteReturn, QueryQueueType>, ConditionBuilder<ExecuteReturn>{}

abstract class ConditionChainQueryBuilder<ExecuteReturn> extends BaseBuilder<ExecuteReturn>{
    
    chainConditioning(data:string[][][]):ConditionedDataWithIdx[][]{
        return data.map((rangeData, idx) => {
            const filterParam = this.queryQueue[idx]
            const result = this.conditioning(rangeData, filterParam)
            return result
        })
    }

}
applyMixins(ConditionChainQueryBuilder, [ChainQueryBuilder, ConditionBuilder])

export default ConditionChainQueryBuilder