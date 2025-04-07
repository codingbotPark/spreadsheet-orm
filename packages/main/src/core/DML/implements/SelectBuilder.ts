import ConditionChainQueryBuilder, { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import SpreadsheetConfig from "@src/config/SpreadConfig";
import { QueryBuilderConfig } from "@src/types/configPicks";
import assertNotNull from "@src/types/assertType";

type TargetColumnType = string[]
type SelectQueryQueueType = {targetColumn:TargetColumnType} & ConditionQueueType

class SelectBuilder<T extends {sheetName?:string}> extends ConditionChainQueryBuilder<typeof SelectBuilder>{
    protected sheetName?: T["sheetName"]; // 필수

    queryQueue: SelectQueryQueueType[] = [];

    protected createQueryForQueue(): SelectQueryQueueType {
        assertNotNull(this.sheetName)
        assertNotNull(this.targetColumn)
        console.log(this.queryQueue)
        const queryQueue:SelectQueryQueueType = {
            ...this.getCurrentCondition(),
            sheetName:this.sheetName,
            targetColumn:this.targetColumn
        }
        return queryQueue
    }
    
    from(sheetName: string) {
        this.sheetName = sheetName
        const instance = new SelectBuilder<T & {sheetName:string}>(this.config, this.targetColumn)
        Object.assign(instance, this) // copy properties
        return instance
    }

    async execute(this:SelectBuilder<T & {sheetName:string}>){
        this.saveCurrentQueryToQueue()
        // console.log("queryQueue", this.queryQueue)
        const compsedRanges = this.queryQueue.map((query) => {
            console.log(query.sheetName)
            // const specifiedColumn = this.specifyColumn(query.targetColumn)
            const specifiedColumn = this.specifyColumn(query.targetColumn)
            const composedRange = this.composeRange(query.sheetName!, this.config.sheet.DATA_STARTING_ROW, specifiedColumn)
            return composedRange
        })
        const requestBody = this.makeRequestBody(compsedRanges)
        console.log("requestBody",requestBody)

        const response = await this.config.spread.API.spreadsheets.values.batchGetByDataFilter({
            spreadsheetId:this.config.spread.ID,
            requestBody:requestBody
        })

        const result = response.data.valueRanges
        if (!result) throw Error("error")

        // extract values only
        const extractedValues = this.extractValuesFromMatch(result)
        // process where
        const conditionedExtractedValues = this.chainConditioning(extractedValues)

        // return result
        return conditionedExtractedValues
    }

    private makeRequestBody(ranges:string[]){
        return {
            dataFilters:ranges.map((range) => ({
                a1Range:range
            }))
        }
    }
    
    // targetColumn 을 target으로 바꿔서, range or dml변수로 사용하도록
    constructor(config:QueryBuilderConfig, protected targetColumn:TargetColumnType = []){
        super(config)
    }
}

export default SelectBuilder


