import { SchemaMap } from "@src/config/SchemaConfig";
import { ColumnSpecificationType } from "@src/config/SheetConfig";
import { FieldsType } from "@src/core/DDL/defineTable";
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


    // columnNames 배열에 있는 columnName 들을 모두 가져올 수 있는 column range
    protected specifyColumn(sheetName:(keyof SchemaMap<T>), columnNames:(keyof T[number]['fields'])[]):ColumnSpecificationType{
        if (!this.config.schema.isSchemaSetted() || columnNames.length === 0) {
            return {};
        }

        const schema = this.config.schema.schemaMap[sheetName];
        if (!schema) {
            return {};
        }

        const columnNumbers = columnNames
            .map(columnName => {
                const field = schema.fields[columnName as string];
                return field ? field.columnOrder + // 순서가 곧 column 위치
                this.config.sheet.columnToNumber(this.config.sheet.DEFAULT_RECORDING_START_COLUMN) 
                : null;
            })
            .filter((num): num is number => num !== null);

        if (columnNumbers.length === 0) {
            return {};
        }

        const minColumn = Math.min(...columnNumbers);
        const maxColumn = Math.max(...columnNumbers);

        return {
            startColumn: this.config.sheet.numberToColumn(minColumn),
            endColumn: this.config.sheet.numberToColumn(maxColumn),
        };
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

