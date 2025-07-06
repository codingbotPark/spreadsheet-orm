import { SchemaMap } from "@src/config/SchemaConfig";
import { ColumnSpecificationType } from "@src/config/SheetConfig";
import Schema from "@src/core/DDL/implements/Schema";
import { QueryBuilderConfig } from "@src/types/configPicks";
import { sheets_v4 } from "googleapis";



export interface Executable<ExecuteReturn>{
    execute():Promise<ExecuteReturn>
}


// execute & has a basic spreadhseet methods
abstract class BaseBuilder<T extends Schema[] = Schema[]>{

    constructor(protected config:QueryBuilderConfig<T>){

    }
    // protected abstract initial
    protected sheetName?:T[number]['sheetName']
    // protected sheetName?:string





    protected specifyColumn(columnNames:(keyof SchemaMap<T>)[]):ColumnSpecificationType{
        // schema 가 설정 안 됐을 때
        const schemaMap = this.config.schema.schemaMap
        if (!schemaMap) return {}

        const specifiedColumns = columnNames.reduce((columnSpecification: ColumnSpecificationType, columnName) => {
            const targetColumn = schemaMap[columnName].fields
            // const targetColumn = dummyDefinedColumn[columnName]?.column;
            if (!(columnName in schemaMap)){
                return columnSpecification;
            }
            if (!targetColumn) return columnSpecification; // targetColumn이 없으면 그대로 리턴
            
            const { startColumn, endColumn } = columnSpecification;

            // 초기값 설정
            if (!startColumn || !endColumn) {
              return { startColumn: targetColumn, endColumn: targetColumn };
            }
        
            // startColumn, endColumn 업데이트
            return {
              startColumn: targetColumn < startColumn ? targetColumn : startColumn,
              endColumn: targetColumn > endColumn ? targetColumn : endColumn
            };
          }, {});


        return columnSpecification
    }

    protected extractValuesFromMatch(matchedValueRange: sheets_v4.Schema$MatchedValueRange[]): string[][][]{

        const extractedValues:string[][][] = matchedValueRange.map((valueRangeObj) => {
        return valueRangeObj.valueRange?.values ?? []; 
        })

        return extractedValues
    }
    
}

export default BaseBuilder

interface DummyColumnOptions{
    column:string
}

// 문자열 key는 삽입 순서
// const dummyDefinedColumn = false
const dummyDefinedColumn:Record<string, DummyColumnOptions> = {
    "name":{
        column:"A"
    },
    "class":{
        column:"B"
    },
    "age":{
        column:"C"
    }
}

