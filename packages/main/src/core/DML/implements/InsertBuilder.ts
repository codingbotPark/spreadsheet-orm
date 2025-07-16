import { DataTypes } from "@src/core/DDL/abstracts/BaseFieldBuilder";
import { QueryBuilderConfig } from "@src/types/configPicks";
import Schema from "@src/core/DDL/implements/Schema";
import AndAbleQueryStore from "../abstracts/mixins/AndAbleQueryStore";
import QueryStore, { BasicQueryQueueType } from "../abstracts/QueryStore";

interface InsertQueryQueueType extends BasicQueryQueueType{
    insertValues:DataTypes[]
}

// class InsertBuilder<T extends Schema[] ,Into extends {sheetName?:string}> extends AndAble<typeof InsertBuilder>{
class InsertBuilder<T extends Schema[]> extends QueryStore<T, InsertQueryQueueType>{
    protected queryQueue:InsertQueryQueueType[] = []
    into(sheetName: T[number]['sheetName']) {
        console.log("insert builder > settedInsertBuilder 생성", this.queryQueue)
        return new SettedInsertBuilder(this.config, this.insertValues, sheetName, this.queryQueue)
    }

    constructor(config: QueryBuilderConfig<T>, private insertValues:DataTypes[]) {
        super(config);
    }
}
export default InsertBuilder



class SettedInsertBuilder<T extends Schema[]> extends AndAbleQueryStore<T, InsertBuilder<T>, InsertQueryQueueType>{
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
        const groupedBySheet = new Map<string, DataTypes[][]>();

        for (const q of this.queryQueue) {
            if (!groupedBySheet.has(q.sheetName)) groupedBySheet.set(q.sheetName, []);
            groupedBySheet.get(q.sheetName)!.push(q.insertValues);
        }

        const tasks = [...groupedBySheet.entries()].map(([sheetName, values]) =>
            this.config.spread.API.spreadsheets.values.append({
                spreadsheetId: this.config.spread.ID,
                valueInputOption: "RAW",
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
}