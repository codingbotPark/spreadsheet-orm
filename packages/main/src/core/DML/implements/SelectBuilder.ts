import { QueryBuilderConfig } from "@src/types/configPicks";
import assertNotNull from "@src/types/assertType";
import WhereableAndQueryStore, { WhereAbleQueueType } from "../abstracts/mixins/WhereableAndQueryStore";
import Schema from "@src/core/DDL/implements/Schema";
import QueryStore from "../abstracts/QueryStore";
import { SchemaMap } from "@src/config/SchemaConfig";
import { DataTypes } from "@src/core/DDL/abstracts/BaseFieldBuilder";

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
        const queryQueue:SelectQueryQueueType = {
            ...this.getCurrentCondition(),
            sheetName:this.sheetName,
            targetColumn:this.targetColumn
        }
        return queryQueue
    }


    async execute(selectOption:{detail:boolean} = {detail:true}){
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
        console.log("extractedValues",extractedValues)
        const conditionedConvertedExtractedValues = this.chainConditioning(selectOption ? this.convertTypeToDefined(extractedValues) : extractedValues)

        // return result
        return conditionedConvertedExtractedValues
    }

    private makeRequestBody(ranges:string[]){
        return {
            dataFilters:ranges.map((range) => ({
                a1Range:range
            }))
        }
    }

    private convertTypeToDefined(extractedValues:string[][][]){
        return extractedValues.map((sheetValue, idx) => {
            const queriedFrom = this.queryQueue[idx].sheetName
            if (!(queriedFrom in this.config.schema.schemaMap)) return sheetValue

            const currentSchema = this.config.schema.schemaMap[queriedFrom as keyof SchemaMap<T>]
            const typeConverters:((value:string)=>DataTypes)[] = currentSchema.orderedColumns.map((column) => {
                const type = currentSchema.fields[column].dataType
                switch (type){
                    case "boolean":
                        return (value:string) => value.toLowerCase() === "true"
                    case "date":
                        return (value:string) => new Date(value)
                    case "number":
                        return (value:string) => Number(value)
                    default:
                        return (value:string) => value
                }
            })

            const result = sheetValue.map((row) => row.map((value,idx) => typeConverters[idx](value)))
            return result
        })
    }

}



