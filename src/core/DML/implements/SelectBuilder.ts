import { sheets_v4 } from "googleapis";
import { GaxiosPromise } from "gaxios";
import ConditionBuilder, { ConditionedDataWithIdx } from "../abstracts/ConditionBuilder";
import ChainQueryBuilder from "../abstracts/ChainQueryBuilder";
import ConditionChainQueryBuilder, { ConditionQueueType } from "../abstracts/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import ExecuteAllPrototypes from "decorator/ExecuteAllPrototypes";
import assertNotNull from "interface/assertType";

interface DummyColumnOptions{
    column:string
}

// 문자열 key는 삽입 순서
const dummyDefinedColumn:Record<string, DummyColumnOptions> = {
    "name":{
        column:"A"
    },
    "class":{
        column:"B"
    }
}


type SelectBuilderRetureType = ConditionedDataWithIdx[][]

class SelectBuilder extends ConditionChainQueryBuilder<Promise<SelectBuilderRetureType>>{
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
        console.log(this.queryQueue)
    }


    private specifyRange(sheetName:string, recordingRow:number, specifiedColumn:Required<RangeSpecificationType> | null):string{
        if (specifiedColumn === null) return sheetName // only sheetName = all data

        const { startColumn, endColumn } = specifiedColumn;
        return `${sheetName}!${startColumn}${recordingRow}:${endColumn}`
    }

    private specifyColumn(columnNames:string[]):null | Required<RangeSpecificationType>{
        // DDL이함들어와야함
        if (!dummyDefinedColumn) return null
        const columnSpecification = columnNames.reduce((columnSpecification: RangeSpecificationType, columnName: string) => {
            const targetColumn = dummyDefinedColumn[columnName]?.column;

            if (!targetColumn) return columnSpecification; // targetColumn이 없으면 그대로 리턴
            const { startColumn, endColumn } = columnSpecification;
        
            // 초기값 설정
            if (startColumn === null || endColumn === null) {
              return { startColumn: targetColumn, endColumn: targetColumn };
            }
        
            // startColumn, endColumn 업데이트
            return {
              startColumn: targetColumn < startColumn ? targetColumn : startColumn,
              endColumn: targetColumn > endColumn ? targetColumn : endColumn
            };
          }, { startColumn: null, endColumn: null });

        if (columnSpecification.startColumn === null) return null

        return columnSpecification
    }

    private extractValuesFromMatch(matchedValueRange: sheets_v4.Schema$MatchedValueRange[]): string[][][]{

        const extractedValues:string[][][] = matchedValueRange.map((valueRangeObj) => {
        return valueRangeObj.valueRange?.values ?? []; 
        })

        return extractedValues
    }
    

}

export default SelectBuilder


interface RangeSpecificationType{
    startColumn:null | string,
    endColumn:null | string
}