import { sheets_v4 } from "googleapis";
import  ConditionChainQueryBuilder, { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import { DataTypes } from "core/DDL/SchemaManager";
import assertNotNull from "types/assertType";
import Tail from "types/BuilderCtorParamType";

export type UpdateValueType = DataTypes[] | {[key:string]:DataTypes}
interface UpdateQueueType extends ConditionQueueType{
    updateValues:UpdateValueType
}

type UpdateBuilderCtorParamType = Tail<ConstructorParameters<typeof UpdateBuilder>>

class UpdateBuilder<T extends {sheetName?:string}> extends ConditionChainQueryBuilder<UpdateBuilderCtorParamType>{
    protected sheetName?: T["sheetName"];
    queryQueue: UpdateQueueType[] = [];

    protected createQueryForQueue(this:UpdateBuilder<T & {sheetName:string}>): UpdateQueueType {
        return {
            sheetName:this.sheetName,
            filterFN:this.filterFN,
            updateValues:this.updateValues
        }  
    }

    from(sheetName: string) {
        this.sheetName = sheetName;
        const instance = new UpdateBuilder<T & {sheetName:string}>(this.config, this.updateValues)
        Object.assign(instance, this)
        return instance; // Ensure method chaining
    }

    async execute(this: UpdateBuilder<T & {sheetName:string}>) {
        const indexedConditionData = await this.getConditionData()
        const updateDataArr = indexedConditionData.map((updateQueueData, idx) => {
            const updateValues = this.queryQueue[idx].updateValues
            const ranges = updateQueueData.flatMap((data) => {
                const row = data.at(0) as number
                return this.composeRange (this.sheetName as string, {startRow:row, endRow:row})  
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

        const result = response.data.totalUpdatedRows

        if (response.status !== 200) throw Error("error")

        return result
    }
    
    constructor(config:SpreadsheetConfig, private updateValues:UpdateValueType){
        super(config)
    }

    // and 를 위해 수정 필요
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

    private async getConditionData(this:UpdateBuilder<T & {sheetName:string}>){

        this.saveCurrentQueryToQueue()

        // where 문에 컬럼을 받게 된다면 구현
        // const specifiedColumn = this.specifyColumn(this.targetColumn)
        const specifiedRange = this.composeRange(this.sheetName as string, this.config.DATA_STARTING_ROW)

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
