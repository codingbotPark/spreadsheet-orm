import { sheets_v4 } from "googleapis";
import BaseBuilder from "./BaseBuilder";


// from, where 구현
abstract class ConditionBuilder<ExecuteReturn> extends BaseBuilder<ExecuteReturn>{
    a1Range:string | null = null
    filterFN:null | ((data:sheets_v4.Schema$MatchedValueRange) => boolean) = null

    where(a1Range:string):this
    where(callbackFN:(data:sheets_v4.Schema$MatchedValueRange) => boolean):this
    where(param:((data:sheets_v4.Schema$MatchedValueRange) => boolean) | string):this{
        if (typeof param === "function"){
           this.filterFN = param 
        } else if (typeof param === "string"){
            this.a1Range = param
        }

        return this
    }

    protected getCurrentCondition(){
        return {
            a1Range:this.a1Range,
            filterFN:this.filterFN
        }
    }

    // 필터링, 인덱스를 포함하는 객체로 만든다
    protected conditioning(){

    }
}

export default ConditionBuilder