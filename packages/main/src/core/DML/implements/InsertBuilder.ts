import { DataTypes, TypeFromLiteral } from "@src/core/DDL/abstracts/BaseFieldBuilder";
import { QueryBuilderConfig } from "@src/types/configPicks";
import Schema from "@src/core/DDL/implements/Schema";
import AndAbleQueryStore from "../abstracts/mixins/AndAbleQueryStore";
import QueryStore, { BasicQueryQueueType } from "../abstracts/QueryStore";
import { SchemaMap } from "@src/config/SchemaConfig";
import SpreadConfig from "@src/config/SpreadConfig";
import { FieldsType } from "@src/core/DDL/defineTable";

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

        // 한 번에 순회하는게 성능상 더 좋은 경우가 많을거라 생각함
        groupedBySheet.entries().map(([sheetName, values]) => {
            const fields = this.config.schema.schemaMap[sheetName].fields
            const typedValues = this.config.schema.recordDetailType ? this.coerceTypes(fields, values) : values
            // const autoInjectedValues = this.autoFieldInjection(fields, )
        })
        // const typedValue = this.config.schema.recordDetailType ? this.coerceTypes(groupedBySheet)
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
            console.log(values)
            const newValues: DataTypes[][] = values.map(row => {
                const newRow = [...row]; // 원본 행 복사

                for (const fieldName in schema.fields) {
                    const field = schema.fields[fieldName];
                    if (field.dataType === 'date' && field.timestampAtCreated) {
                        const columnIndex = field.columnOrder - 1; // columnOrder는 1부터 시작, 배열 인덱스는 0부터 시작
                        const now = new Date();
                        newRow[columnIndex] = SpreadConfig.jsDateToSheetsSerial(now);
                    }
                }
                return newRow;
            });
            newGroupedBySheet.set(sheetName, newValues);
        }
        return newGroupedBySheet;
    }

    private coerceTypes(schemaFields:FieldsType ,values:DataTypes[][]){ // convert actual type from

    }   
    private autoFieldInjection(schemaFields:FieldsType, values:DataTypes[][]){ // createdAt, updatedAt, default 같은 컬럼 처리
        
    }
    
}