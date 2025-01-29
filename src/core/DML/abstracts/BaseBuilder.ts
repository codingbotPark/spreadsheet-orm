import SpreadsheetConfig from "config/SpreadsheetConfig";
import { sheets_v4 } from "googleapis";

interface ParsedRange {
    sheetName?: string;
    startCell: { column: string; row: number };
    endCell?: { column: string; row: number };
}

// execute & has a basic spreadhseet methods
abstract class BaseBuilder<ExecuteReturn>{

    constructor(protected config:SpreadsheetConfig){}
    protected sheetName:string | null = null
    abstract execute():ExecuteReturn

    parseCell(cellAddress:string){
        

        const match = cellAddress.match(/^([A-Z]+)(\d+)$/);

        if (!match) {
            throw new Error("Invalid A1 cell address format");
        }
    
        const column = match[1]; // 문자 (열)
        const row = parseInt(match[2], 10); // 숫자 (행)
    
        return { column, row };
    }

    parseRange(range: string): ParsedRange {
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

    protected compseRange(sheetName:string, row:RowSpecificationType, specifiedColumn?:ColumnSpecificationType):string
    protected compseRange(sheetName:string, row:number, specifiedColumn?:ColumnSpecificationType):string
    protected compseRange(sheetName:string, row:RowSpecificationType | number, specifiedColumn?:ColumnSpecificationType):string{

        const startRow = typeof row === "number" ? row : row.startRow
        const endRow = typeof row === "number" ? '' : (row.endRow ?? startRow)
        const startColumn = (specifiedColumn && specifiedColumn.startColumn) ?? 'A'
        const endColumn = (specifiedColumn && specifiedColumn.endColumn) ?? 'ZZZ'

        return `${sheetName}!${startColumn}${startRow}:${endColumn}${endRow}`
    }

    protected compseColumn(columnNames:string[]):ColumnSpecificationType{
        const defaultColumns = { startColumn: null, endColumn: null } 

        // DDL이함들어와야함
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
const dummyDefinedColumn:Record<string, DummyColumnOptions> = {
    "name":{
        column:"A"
    },
    "class":{
        column:"B"
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