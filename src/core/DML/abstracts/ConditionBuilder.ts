import { sheets_v4 } from "googleapis";
import BaseBuilder from "./BaseBuilder";


// from, where 구현
// 원래 where 은 data 를 다 가져온 후 실행된다
abstract class ConditionBuilder<ExecuteReturn> extends BaseBuilder<ExecuteReturn>{
    filterFN?:ConditionParamTypes["filterFN"]

    where(param:ConditionParamTypes[keyof ConditionParamTypes]):this{
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
    protected conditioning(
        data:string[][],
        filterParam:ConditionParamTypes = {
            filterFN:this.filterFN
        }
    ):ConditionedDataWithIdx[]{
          // 데이터 복사 및 인덱싱
        const tempData = data.map((currData, idx) => [idx + this.config.DATA_STARTING_ROW, ...currData] as ConditionedDataWithIdx);

        const { filterFN } = filterParam;

        // 필터링 조건 처리
        if (filterFN) {
            return tempData.filter((data) => filterFN(data));
        }

        return tempData;
    }

}

export interface ConditionParamTypes {
    filterFN?:(data:ConditionedDataWithIdx) => boolean
}
export type ConditionedDataWithIdx = [number, ...string[]]


export default ConditionBuilder