import { sheets_v4 } from "googleapis";
import { GaxiosPromise } from "gaxios";
import ConditionBuilder, { ConditionedDataWithIdx } from "../abstracts/ConditionBuilder";
import ChainQueryBuilder from "../abstracts/ChainQueryBuilder";
import ConditionChainQueryBuilder, { ConditionQueueType } from "../abstracts/mixins/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import ExecuteAllPrototypes from "decorator/ExecuteAllPrototypes";
import assertNotNull from "interface/assertType";
import RangeDataConditionChainQueryBuilder from "../abstracts/mixins/RangeDataConditionChainQueryBuilder";



type SelectBuilderRetureType = ConditionedDataWithIdx[][]

class SelectBuilder extends RangeDataConditionChainQueryBuilder<Promise<SelectBuilderRetureType>>{
    queryQueue: ConditionQueueType[] = [];
    
    from(sheetName: string) {
        this.sheetName = sheetName;
        return this; // Ensure method chaining
    }

    async execute(){
        assertNotNull(this.sheetName)
        this.addQueryToQueue(this.createQueryForQueue())
        

        const specifiedColumn = this.specifyColumn(this.targetColumn)
        const specifiedRange = this.specifyRange(this.sheetName, this.config.DEFAULT_RECORDING_START_ROW, specifiedColumn)


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
    constructor(config:SpreadsheetConfig, private targetColumn:string[]){
        super(config)
    }



}

export default SelectBuilder


