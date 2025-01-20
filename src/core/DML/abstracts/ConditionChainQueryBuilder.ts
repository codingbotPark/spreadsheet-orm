import applyMixins from "interface/mixin";
import ChainQueryBuilder from "./ChainQueryBuilder";
import ConditionBuilder from "./ConditionBuilder";
import { sheets_v4 } from "googleapis";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import BaseBuilder from "./BaseBuilder";

interface ConditionQueueType {
    sheetName:string;
    a1Range:string | null; 
    filterFN:((data: sheets_v4.Schema$MatchedValueRange) => boolean) | null;
}

// mixin class
interface ConditionChainQueryBuilder<ExecuteReturn> extends ChainQueryBuilder<ConditionQueueType, ExecuteReturn>, ConditionBuilder<ExecuteReturn>{}

abstract class ConditionChainQueryBuilder<ExecuteReturn> extends BaseBuilder<ExecuteReturn>{

    // queue object for conditionChainQueryQueue
    createQueryForQueue():ConditionQueueType{
        if (!this.sheetName) throw  Error("need sheetName")
        const condition = {
            sheetName:this.sheetName,
            a1Range:this.a1Range,
            filterFN:this.filterFN,
        }
        return condition
    }   
}
applyMixins(ConditionChainQueryBuilder, [ChainQueryBuilder, ConditionBuilder])

export default ConditionChainQueryBuilder