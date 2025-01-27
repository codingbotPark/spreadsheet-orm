import { sheets_v4 } from "googleapis";
import  { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import { DataTypes } from "core/DDL/SchemaManager";
import assertNotNull from "interface/assertType";
import RangeDataConditionChainQueryBuilder from "../abstracts/mixins/RangeDataConditionChainQueryBuilder";
import { ConditionedDataWithIdx } from "../abstracts/ConditionBuilder";

export type UpdateValueType = DataTypes[] | {[key:string]:DataTypes}
interface UpdateQueueType extends ConditionQueueType{
    updateValues:UpdateValueType
}

class UpdateBuilder extends RangeDataConditionChainQueryBuilder<Promise<sheets_v4.Schema$DataFilterValueRange[]>>{
    queryQueue: UpdateQueueType[] = [];

    createQueryForQueue(): UpdateQueueType {
        assertNotNull(this.sheetName)
        assertNotNull(this.updateValues)

        return {
            sheetName:this.sheetName,
            filterFN:this.filterFN,
            updateValues:this.updateValues
        }  
    }

    from(sheetName: string): this {
        this.sheetName = sheetName;
        return this; // Ensure method chaining
    }

    async execute() {
        assertNotNull(this.sheetName)

        const indexedConditionData = await this.getConditionData()
        const updateDataArr = indexedConditionData.map((updateQueueData, idx) => {
            const updateValues = this.queryQueue[idx].updateValues
            const ranges = updateQueueData.flatMap((data) => {
                const row = data.at(0) as number
                return this.specifyRange (this.sheetName as string, {startRow:row, endRow:row})  
            })
            return this.makeUpdateDataArr(ranges, updateValues)
        }).flat()

        const response = await this.config.spreadsheetAPI.spreadsheets.values.batchUpdateByDataFilter({
            spreadsheetId:this.config.spreadsheetID,
            requestBody:{
                data:updateDataArr,
                valueInputOption:"USER_ENTERED"
            }
        })

        console.log(response.data)
        const result = response.data.totalUpdatedRows
        if (!result) throw Error("error")

        return updateDataArr
    }
    
    constructor(config:SpreadsheetConfig, private updateValues:UpdateValueType){
        super(config)
    }

    private makeUpdateDataArr(ranges:string[], values:UpdateValueType):sheets_v4.Schema$DataFilterValueRange[]{
        if (Array.isArray(values)){
            return ranges.reduce((updateDataArr:sheets_v4.Schema$DataFilterValueRange[] ,range) => {
                updateDataArr.push({
                    dataFilter:{
                        a1Range:range
                    },
                    values:[values]
                })
                return updateDataArr
            }, [])
        }

        // 객체일 땐, matchColumnWithDefine 을 DDL과 추가하기
        return []
    }

    private async getConditionData(){
        assertNotNull(this.sheetName)


        this.addQueryToQueue(this.createQueryForQueue())

        // where 문에 컬럼을 받게 된다면 구현
        // const specifiedColumn = this.specifyColumn(this.targetColumn)
        const specifiedRange = this.specifyRange(this.sheetName, this.config.DATA_STARTING_ROW)

        const response = await this.config.spreadsheetAPI.spreadsheets.values.batchGetByDataFilter({
            spreadsheetId:this.config.spreadsheetID,
            requestBody:{
                // query queue 나열
                dataFilters:[
                    {
                        a1Range:specifiedRange,
                    }
                ]
            }
        })

        const result = response.data.valueRanges
        if (!result) throw Error("error")
        // extract values only
        const extractedValues = this.extractValuesFromMatch(result)
        // process where
        const conditionedExtractedValues = this.chainConditioning(extractedValues)
        return conditionedExtractedValues
    }
}

export default UpdateBuilder
