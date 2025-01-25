import { sheets_v4 } from "googleapis";
import BaseBuilder from "./BaseBuilder";


// from, where 구현
// 원래 where 은 data 를 다 가져온 후 실행된다
abstract class ConditionBuilder<ExecuteReturn> extends BaseBuilder<ExecuteReturn>{
    filterFN?:((data:ConditionedDataWithIdx) => boolean)

    where(callbackFN:(data:ConditionedDataWithIdx) => boolean):this
    where(param:((data:ConditionedDataWithIdx) => boolean)):this{
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
    // protected conditioning(data:string[][], filterParam:ConditionParamTypes, includeIdx:boolean):string[][]
    protected conditioning(
        data:string[][],
        filterParam:ConditionParamTypes = {
            filterFN:this.filterFN
        }
    ):ConditionedDataWithIdx[]{
        const { filterFN } = filterParam

        const indexedData = this.indexingData(data)

        if (filterFN) {
            return indexedData.filter((currData:ConditionedDataWithIdx) => filterFN(currData))
        }


        return data.map((currData,idx)=>[idx, ...currData])
    }

    private indexingData(data:string[][]):ConditionedDataWithIdx[]{
        return data.map((currData,idx)=>[idx + this.config.DEFAULT_RECORDING_START_ROW, ...currData])
    }

}

export interface ConditionParamTypes {
    filterFN?:(data:ConditionedDataWithIdx) => boolean
}
export type ConditionedDataWithIdx = [number, ...string[]]


export default ConditionBuilder