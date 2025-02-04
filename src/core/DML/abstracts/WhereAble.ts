import { sheets_v4 } from "googleapis";
import BaseBuilder from "./BaseBuilder";
import assertNotNull from "types/assertType";


// from, where 구현
// 원래 where 은 data 를 다 가져온 후 실행된다
abstract class WhereAble extends BaseBuilder{
    protected filterFN?:ConditionParamTypes["filterFN"]

    where(param:ConditionParamTypes[keyof ConditionParamTypes]):this{
        if (typeof param === "function"){
           this.filterFN = param 
        }

        return this
    }

    // for one get ConditionedData
    protected async getConditionedData():Promise<DataWithRowType[]>{
        const range = this.composeRange(this.sheetName as string, this.config.DATA_STARTING_ROW)
        const dataFilters = this.makeDataFilters([range])
        const batchData = await this.fetchBatchData(this.config.spreadsheetID, dataFilters)
        const batchValues = this.extractValuesFromMatch(batchData)
        console.log("batchValues",batchValues)
        const indexedBatchValue = this.indexingBatchData(batchValues[0])
        const conditionedBatchValue = this.conditioning(indexedBatchValue)
        return conditionedBatchValue
    }

    protected getCurrentCondition(){
        return {
            sheetName:this.sheetName,
            filterFN:this.filterFN
        }
    }

    // 필터링, 인덱스를 포함하는 객체로 만든다
    protected conditioning(
        dataWithRow:DataWithRowType[],
        filterParam:ConditionParamTypes = {
            filterFN:this.filterFN
        }
    ):DataWithRowType[]{
          // 데이터 복사 및 인덱싱

        const { filterFN } = filterParam;
        // 필터링 조건 처리
        if (filterFN) {
            return dataWithRow.filter((data) => filterFN(data));
        }

        return dataWithRow;
    }

    protected async fetchBatchData(spreadsheetID:string, dataFilters:sheets_v4.Schema$DataFilter[]):Promise<sheets_v4.Schema$MatchedValueRange[]>{
        const response = await this.config.spreadsheetAPI.spreadsheets.values.batchGetByDataFilter({
            spreadsheetId:spreadsheetID,
            requestBody:{
                dataFilters
            }
        })
        
        const values = response.data.valueRanges
        if (!values) throw Error("fail to fetch data")
        
        return values
    }

    protected indexingBatchData(data:string[][]):DataWithRowType[]{
        return data.map((currData, idx) => [idx + this.config.DATA_STARTING_ROW, ...currData] as DataWithRowType);
    }

    protected makeDataFilters(ranges:string[]){
        return ranges.map((range) => ({
            a1Range:range
        }))
    }

}

export interface ConditionParamTypes {
    filterFN?:(data:DataWithRowType) => boolean
}
// first idx = row num
export type DataWithRowType = [number, ...string[]]


export default WhereAble