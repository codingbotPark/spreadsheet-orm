import applyMixins from "interface/mixin";
import ChainQueryBuilder from "./ChainQueryBuilder";
import ConditionBuilder, { ConditionedDataWithIdx, ConditionParamTypes } from "./ConditionBuilder";
import { sheets_v4 } from "googleapis";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import BaseBuilder from "./BaseBuilder";

export interface ConditionQueueType extends ConditionParamTypes{
    sheetName:string;
}

// mixin class
interface ConditionChainQueryBuilder<ExecuteReturn> extends ChainQueryBuilder<ConditionQueueType, ExecuteReturn>, ConditionBuilder<ExecuteReturn>{}

abstract class ConditionChainQueryBuilder<ExecuteReturn> extends BaseBuilder<ExecuteReturn>{
    
    // queue object for conditionChainQueryQueue
    createQueryForQueue():ConditionQueueType{
        if (!this.sheetName) throw  Error("need sheetName")
        const condition = {
            sheetName:this.sheetName,
            filterFN:this.filterFN,
        }
        console.log("condition", condition)
        return condition
    }
    
    chainConditioning(data:string[][][]):ConditionedDataWithIdx[][]{
        return data.map((rangeData, idx) => {
            const filterParam = this.queryQueue[idx]
            return this.conditioning(rangeData, filterParam)
        })
    }

}
applyMixins(ConditionChainQueryBuilder, [ChainQueryBuilder, ConditionBuilder])

export default ConditionChainQueryBuilder