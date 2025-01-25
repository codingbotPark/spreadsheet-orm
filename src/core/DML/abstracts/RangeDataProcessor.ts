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

    protected specifyRange(sheetName:string, recordingRow:number, specifiedColumn:Required<RangeSpecificationType> | null):string{
        if (specifiedColumn === null) return sheetName // only sheetName = all data

        const { startColumn, endColumn } = specifiedColumn;
        return `${sheetName}!${startColumn}${recordingRow}:${endColumn}`
    }

    protected specifyColumn(columnNames:string[]):null | Required<RangeSpecificationType>{
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

    protected extractValuesFromMatch(matchedValueRange: sheets_v4.Schema$MatchedValueRange[]): string[][][]{

        const extractedValues:string[][][] = matchedValueRange.map((valueRangeObj) => {
        return valueRangeObj.valueRange?.values ?? []; 
        })

        return extractedValues
    }
    

    // Add other abstract or concrete methods as needed
}

interface RangeSpecificationType{
    startColumn:null | string,
    endColumn:null | string
}

export default RangeDataProcessor