import { DataTypes, TypeFromLiteral } from "@src/core/DDL/abstracts/BaseFieldBuilder";
import { QueryBuilderConfig } from "@src/types/configPicks";
import Schema from "@src/core/DDL/implements/Schema";
import AndAbleQueryStore from "../abstracts/mixins/AndAbleQueryStore";
import QueryStore, { BasicQueryQueueType } from "../abstracts/QueryStore";
import { SchemaMap } from "@src/config/SchemaConfig";

interface InsertQueryQueueType extends BasicQueryQueueType{
    insertValues:DataTypes[]
}

class InsertBuilder<T extends Schema[], Sheetname extends T[number]['sheetName']> extends QueryStore<T, InsertQueryQueueType>{
    protected queryQueue:InsertQueryQueueType[] = []
    into(sheetName: Sheetname) {
        return new SettedInsertBuilder(this.config, this.insertValues, sheetName, this.queryQueue)
    }

    constructor(config: QueryBuilderConfig<T>, private insertValues:DataTypes[]) {
        super(config);
    }
}
export default InsertBuilder



class SettedInsertBuilder<T extends Schema[], SheetName extends T[number]['sheetName']> extends AndAbleQueryStore<T, InsertBuilder<T, SheetName>, InsertQueryQueueType>{
    // constructor(config:QueryBuilderConfig<T>, private insertValues:OrderedValueTypes<S[SheetName]['fields'], S[SheetName]['orderedColumns']>, protected sheetName:SheetName, protected queryQueue:InsertQueryQueueType[]){
    constructor(config:QueryBuilderConfig<T>, private insertValues:DataTypes[], protected sheetName:T[number]['sheetName'], protected queryQueue:InsertQueryQueueType[]){
        super(config, InsertBuilder)
        this.saveCurrentQueryToQueue();
    }

    protected createQueryForQueue(): InsertQueryQueueType {
        // Implementation for creating a query for the queue
        return {
            // Example structure, adjust as needed
            sheetName:this.sheetName,
            insertValues:this.insertValues
        };
    }
    async execute() {
        // append 요청은 하나의 시트에 여러 개의 요청을 보낼 수 있어서, 시트별로 그룹화함
        const groupedBySheet = new Map<keyof SchemaMap<T>, DataTypes[][]>();

        for (const q of this.queryQueue) {
            if (!groupedBySheet.has(q.sheetName)) groupedBySheet.set(q.sheetName, []);
            groupedBySheet.get(q.sheetName)!.push(q.insertValues);
        }

        const filledGroupedBySheet = this.fillCreatedAtColumn(groupedBySheet);

        const tasks = [...filledGroupedBySheet.entries()].map(([sheetName, values]) => // filledGroupedBySheet 사용
            this.config.spread.API.spreadsheets.values.append({
                spreadsheetId: this.config.spread.ID,
                valueInputOption: "USER_ENTERED",
                range: sheetName,
                requestBody: { values },
            })
        );

        const responses = await Promise.all(tasks);

        return responses.map(res => {
          if (res.status !== 200) throw Error("error");
          return res.data.updates?.updatedRows;
        });
      }
    
    private fillCreatedAtColumn(groupedBySheet:Map<keyof SchemaMap<T>, DataTypes[][]>): Map<string, DataTypes[][]> {
        const newGroupedBySheet = new Map<keyof SchemaMap<T>, DataTypes[][]>();

        for (const [sheetName, values] of groupedBySheet.entries()) {
            const schema = this.config.schema.schemaMap[sheetName];
            if (!schema) {
                newGroupedBySheet.set(sheetName, values); // 스키마 없으면 원본 그대로
                continue;
            }

            const newValues: DataTypes[][] = values.map(row => {
                const newRow = [...row]; // 원본 행 복사

                for (const fieldName in schema.fields) {
                    const field = schema.fields[fieldName];
                    // if (field.dataType === 'date' && field.timestampAtCreated) {
                    //     const columnIndex = field.columnOrder - 1; // columnOrder는 1부터 시작, 배열 인덱스는 0부터 시작

                    //     const now = new Date();
                    //     newRow[columnIndex] = this.dateToGoogleSheetsSerial(now); // not working now
                    // }
                }
                return newRow;
            });
            newGroupedBySheet.set(sheetName, newValues);
        }
        return newGroupedBySheet;
    }

    // Google Sheets 시리얼 번호로 변환하는 헬퍼 함수
    private jsDateToSheetsSerial(jsDate:Date) {
        // Google Sheets의 기준 날짜 (1899년 12월 30일)
        // JavaScript Date 객체는 월을 0부터 시작하므로 11은 12월을 의미합니다.
        const sheetsEpoch = new Date(1899, 11, 30, 0, 0, 0);

        // JavaScript Date 객체와 Sheets 기준 날짜 간의 밀리초 차이 계산
        const diffMillis = jsDate.getTime() - sheetsEpoch.getTime();

        // 1일의 밀리초 (24시간 * 60분 * 60초 * 1000밀리초)
        const millisPerDay = 24 * 60 * 60 * 1000;

        // 일수로 변환
        let sheetsSerial = diffMillis / millisPerDay;

        // Google Sheets (및 Excel)의 1900년 윤년 버그 보정
        // 1900년 2월 29일은 실제로는 존재하지 않았지만, Sheets는 이를 날짜로 계산합니다.
        // 따라서 1900년 3월 1일 이후의 날짜에는 1을 더해줘야 합니다.
        if (jsDate.getFullYear() > 1900 || (jsDate.getFullYear() === 1900 && jsDate.getMonth() > 1)) {
            sheetsSerial += 1;
        }

        return sheetsSerial;
    }
    
}