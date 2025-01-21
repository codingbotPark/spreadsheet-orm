import SpreadsheetConfig from "config/SpreadsheetConfig";

interface ParsedRange {
    sheetName?: string;
    startCell: { column: string; row: number };
    endCell?: { column: string; row: number };
}

// execute & has a basic spreadhseet methods
abstract class BaseBuilder<ExecuteReturn = void>{

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
    
}

export default BaseBuilder