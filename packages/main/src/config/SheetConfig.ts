import { CellType } from "@src/types/spreadType"

export interface SheetConfigOptions {

}

class SheetConfig {

    // lowest = 1
    DEFAULT_RECORDING_START_ROW = 1
    DEFAULT_RECORDING_START_COLUMN = "A" // A = 1

    DEFAULT_COLUMN_NAME_SIZE = 1
    DATA_STARTING_ROW = this.DEFAULT_RECORDING_START_ROW + this.DEFAULT_COLUMN_NAME_SIZE
    // 따로 config 파일에서 사용하거나, default를 사용하거나

    DATA_STARTING_CELL: CellType = { column: this.DEFAULT_RECORDING_START_COLUMN, row: this.DATA_STARTING_ROW }

    parseCell(cellAddress: string) {
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

    composeRange(sheetName: string, row: RowSpecificationType, specifiedColumn?: ColumnSpecificationType): string
    composeRange(sheetName: string, row: number, specifiedColumn?: ColumnSpecificationType): string
    composeRange(
        sheetName: string,
        row: RowSpecificationType | number,
        specifiedColumn: ColumnSpecificationType
    ): string {
        const settedSpecifiedColumn = { // set with default value
            ...{startColumn:'A', endColumn:'ZZZ'},
            ...specifiedColumn
        }
        const isNumber = typeof row === 'number';
        const startRow = isNumber ? row : row.startRow;
        const endRow = isNumber ? '' : (row.endRow ?? row.startRow);
        const {startColumn, endColumn} = settedSpecifiedColumn

        return `${sheetName}!${startColumn}${startRow}:${endColumn}${endRow}`;
    }

    numberToColumn(n: number): string {
        if (n < 1) throw new Error("Column number must be >= 1");
        if (n > 18278) throw new Error("Google Sheets supports up to 18278 columns (ZZZ)");
        let result = "";
        while (n > 0) {
            n--; // Adjust for 1-based index (A=1)
            result = String.fromCharCode((n % 26) + 65) + result;
            n = Math.floor(n / 26);
        }
        return result;
    }

    columnToNumber(column: string): number { // a = 1
        let result = 0;
        const upper = column.toUpperCase();

        for (let i = 0; i < upper.length; i++) {
            const charCode = upper.charCodeAt(i) - 64; // 'A' is 65 in ASCII
            if (charCode < 1 || charCode > 26) throw new Error("Invalid column letter: " + column);
            result = result * 26 + charCode;
        }

        return result;
    }

    calcColumn(base: string, offset: number): string {
        const baseNumber = this.columnToNumber(base);
        const resultNumber = baseNumber + offset;
        return this.numberToColumn(resultNumber);
    }


    constructor(options: SheetConfigOptions) {

    }
}

export default SheetConfig


export interface ParsedRange {
    sheetName?: string;
    startCell: CellType;
    endCell?: CellType;
}


export interface ColumnSpecificationType {
    startColumn?: string,
    endColumn?: string
}
export interface RowSpecificationType {
    startRow: number,
    endRow?: number
}