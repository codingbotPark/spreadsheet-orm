import ConditionChainQueryBuilder, { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import assertNotNull from "types/assertType";
import Tail from "types/Tail";

type SelectBuilderCtorParamType = Tail<ConstructorParameters<typeof SelectBuilder>>

class SelectBuilder<T extends {sheetName?:string}> extends ConditionChainQueryBuilder<SelectBuilderCtorParamType>{
    protected sheetName?: T["sheetName"]; // 필수

    queryQueue: ConditionQueueType[] = [];

    protected createQueryForQueue(): ConditionQueueType {
        assertNotNull(this.sheetName)
        assertNotNull(this.targetColumn)

        const queryQueue = this.getCurrentCondition()
        return queryQueue
    }
    
    from(sheetName: string) {
        this.sheetName = sheetName
        const instance = new SelectBuilder<T & {sheetName:string}>(this.config, this.targetColumn)
        Object.assign(instance, this) // copy properties
        return instance
    }

    async execute(this:SelectBuilder<T & {sheetName:string}>){
        this.addQueryToQueue(this.createQueryForQueue())

        const specifiedColumn = this.compseColumn(this.targetColumn)
        const specifiedRange = this.compseRange(this.sheetName!, this.config.DATA_STARTING_ROW, specifiedColumn)
        console.log("specifiedRange", specifiedRange)

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

        // return result
        return conditionedExtractedValues
    }
    
    // targetColumn 을 target으로 바꿔서, range or dml변수로 사용하도록
    constructor(config:SpreadsheetConfig, protected targetColumn:string[] = []){
        super(config)
    }
}

export default SelectBuilder


