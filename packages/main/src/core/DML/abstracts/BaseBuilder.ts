import ClientConfig from "@src/config/ClientConfig";
import { QueryBuilderConfig } from "@src/types/configPicks";
import { sheets_v4 } from "googleapis";

interface ParsedRange {
    sheetName?: string;
    startCell: { column: string; row: number };
    endCell?: { column: string; row: number };
}

export interface Executable<ExecuteReturn>{
    execute():Promise<ExecuteReturn>
}


// execute & has a basic spreadhseet methods
abstract class BaseBuilder{

    constructor(protected config:QueryBuilderConfig){

    }
    // protected abstract initial
    protected abstract sheetName?:string
    // protected sheetName?:string

    protected parseCell(cellAddress:string){
        

        const match = cellAddress.match(/^([A-Z]+)(\d+)$/);

        if (!match) {
            throw new Error("Invalid A1 cell address format");
        }
    
        const column = match[1]; // 문자 (열)
        const row = parseInt(match[2], 10); // 숫자 (행)
    
        return { column, row };
    }

    protected parseRange(range: string): ParsedRange {
        // sheetName과 Range 분리
        const [sheetNameOrCells, endPart] = range.split("!");
        const hasSheetName = endPart !== undefined;
        const sheetName = hasSheetName ? sheetNameOrCells : undefined;
        const rangePart = hasSheetName ? endPart : sheetNameOrCells;
    
        // Start와 End 셀 분리
        const [startCell, endCell] = rangePart.split(":");
    
        if (!startCell) {
            throw new Error("Invalid range format: startCell is missing");
        }
    
        const start = this.parseCell(startCell);
        const end = endCell ? this.parseCell(endCell) : undefined;
    
        return {
            sheetName,
            startCell: start,
            endCell: end,
        };
    }

    protected composeRange(sheetName:string, row:RowSpecificationType, specifiedColumn?:ColumnSpecificationType):string
    protected composeRange(sheetName:string, row:number, specifiedColumn?:ColumnSpecificationType):string
    protected composeRange(sheetName:string, row:RowSpecificationType | number, specifiedColumn?:ColumnSpecificationType):string{

        const startRow = typeof row === "number" ? row : row.startRow
        const endRow = typeof row === "number" ? '' : (row.endRow ?? startRow)
        const startColumn = (specifiedColumn && specifiedColumn.startColumn) ?? 'A'
        const endColumn = (specifiedColumn && specifiedColumn.endColumn) ?? 'ZZZ'

        return `${sheetName}!${startColumn}${startRow}:${endColumn}${endRow}`
    }

    protected specifyColumn(columnNames:string[]):ColumnSpecificationType{
        const defaultColumns = { startColumn: null, endColumn: null } 

        // DDL이함들어와야함
        return defaultColumns
        if (!dummyDefinedColumn) return defaultColumns

        const columnSpecification = columnNames.reduce((columnSpecification: ColumnSpecificationType, columnName: string) => {
            const targetColumn = dummyDefinedColumn[columnName]?.column;

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
          }, defaultColumns);


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

interface ColumnSpecificationType{
    startColumn:string | null,
    endColumn:string | null
}
interface RowSpecificationType{
    startRow:number,
    endRow?:number
}