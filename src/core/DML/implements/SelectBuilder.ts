import { sheets_v4 } from "googleapis";
import { GaxiosPromise } from "gaxios";
import ConditionBuilder from "../abstracts/ConditionBuilder";
import ChainQueryBuilder from "../abstracts/ChainQueryBuilder";
import ConditionChainQueryBuilder from "../abstracts/ConditionChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";

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


class SelectBuilder extends ConditionChainQueryBuilder<Promise<sheets_v4.Schema$MatchedValueRange[]>>{
    

    from(sheetName:string){
        this.sheetName = sheetName
    }
    
    async execute(){

        
        const specifiedRange = this.specifyRange(this.sheetName)

        const response = await this.config.spreadsheetAPI.spreadsheets.values.batchGetByDataFilter({
            spreadsheetId:this.config.spreadsheetID,
            requestBody:{
                dataFilters:[
                    {
                        
                    }
                ]
            }
        })

        const result = response.data.valueRanges
        if (!result) throw Error("error")

        // return result
        return result
    }

    constructor(config:SpreadsheetConfig, protected targetColumn:string[]){
        super(config)
    }

    private specifyRange(sheetName:string){

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
    

}

export default SelectBuilder


interface RangeSpecificationType{
    startColumn:null | string,
    endColumn:null | string
}