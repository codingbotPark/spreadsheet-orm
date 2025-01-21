import { sheets_v4 } from "googleapis";
import BaseBuilder from "./BaseBuilder";


// from, where 구현
// 원래 where 은 data 를 다 가져온 후 실행된다
abstract class ConditionBuilder<ExecuteReturn> extends BaseBuilder<ExecuteReturn>{
    filterFN:null | ((data:sheets_v4.Schema$MatchedValueRange) => boolean) = null

    where(callbackFN:(data:sheets_v4.Schema$MatchedValueRange) => boolean):this
    where(param:((data:sheets_v4.Schema$MatchedValueRange) => boolean)):this{
        if (typeof param === "function"){
           this.filterFN = param 
        }

        return this
    }

    protected getCurrentCondition(){
        return {
            filterFN:this.filterFN
        }
    }

    // 필터링, 인덱스를 포함하는 객체로 만든다
    protected conditioning(data:sheets_v4.Schema$MatchedValueRange){

    }
}

export default ConditionBuilder