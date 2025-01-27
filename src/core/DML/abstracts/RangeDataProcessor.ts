import { sheets_v4 } from "googleapis";

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

abstract class RangeDataProcessor {


    // row O column X -> 특정 행(sheet1!1:1)
    // row O column O -> 특정 셀(sheet1!A1)
    protected specifyRange(sheetName:string, row:RowSpecificationType, specifiedColumn?:ColumnSpecificationType):string
    protected specifyRange(sheetName:string, row:number, specifiedColumn?:ColumnSpecificationType):string
    protected specifyRange(sheetName:string, row:RowSpecificationType | number, specifiedColumn?:ColumnSpecificationType):string{

        const startRow = typeof row === "number" ? row : row.startRow
        const endRow = typeof row === "number" ? '' : (row.endRow ?? startRow)
        const startColumn = (specifiedColumn && specifiedColumn.startColumn) ?? 'A'
        const endColumn = (specifiedColumn && specifiedColumn.endColumn) ?? 'ZZZ'

        return `${sheetName}!${startColumn}${startRow}:${endColumn}${endRow}`
    }

    protected specifyColumn(columnNames:string[]):ColumnSpecificationType{
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

    

    // Add other abstract or concrete methods as needed
}

interface ColumnSpecificationType{
    startColumn:string | null,
    endColumn:string | null
}
interface RowSpecificationType{
    startRow:number,
    endRow?:number
}

export default RangeDataProcessor