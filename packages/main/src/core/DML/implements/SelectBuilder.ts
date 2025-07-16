import { QueryBuilderConfig } from "@src/types/configPicks";
import assertNotNull from "@src/types/assertType";
import WhereableAndQueryStore, { WhereAbleQueueType } from "../abstracts/mixins/WhereableAndQueryStore";
import Schema from "@src/core/DDL/implements/Schema";
import QueryStore from "../abstracts/QueryStore";

type SelectQueryQueueType = WhereAbleQueueType & {targetColumn:string[]}

class SelectBuilder<T extends Schema[]> extends QueryStore<T, SelectQueryQueueType>{
    protected queryQueue:SelectQueryQueueType[] = []
    from(sheetName: T[number]['sheetName']) {
        return new SettedSelectBuilder(this.config, this.targetColumn, sheetName, this.queryQueue)
    }
    
    // targetColumn 을 target으로 바꿔서, range or dml변수로 사용하도록
    constructor(config:QueryBuilderConfig<T>, protected targetColumn:string[] = []){
        super(config)
    }
}

export default SelectBuilder


class SettedSelectBuilder<T extends Schema[]>
extends WhereableAndQueryStore<T, SelectBuilder<T>, SelectQueryQueueType>{
    constructor(config:QueryBuilderConfig<T>, private targetColumn:string[], protected sheetName:T[number]['sheetName'], protected queryQueue:SelectQueryQueueType[]){
        super(config, SelectBuilder)
        this.saveCurrentQueryToQueue()
    }

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


    async execute(){
        const composedRanges = this.queryQueue.map((query) => {
            console.log(query.sheetName)
            // const specifiedColumn = this.specifyColumn(query.targetColumn)
            const specifiedColumn = this.specifyColumn(query.sheetName ,query.targetColumn)
            const composedRange = this.config.sheet.composeRange(query.sheetName, this.config.sheet.DATA_STARTING_ROW, specifiedColumn)
            return composedRange
        })
        console.log("composedRanges",composedRanges)
        const requestBody = this.makeRequestBody(composedRanges)
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

}



