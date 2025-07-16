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
    into(sheetName: T[number]['sheetName']) {
        console.log("insert builder > settedInsertBuilder 생성")
        return new SettedInsertBuilder(this.config, this.insertValues, sheetName, this.queryQueue)
    }

    constructor(config: QueryBuilderConfig<T>, private insertValues:DataTypes[]) {
        super(config);
    }
}
export default InsertBuilder



class SettedInsertBuilder<T extends Schema[]> extends AndAbleQueryStore<T, InsertBuilder<T>, InsertQueryQueueType>{
    constructor(config:QueryBuilderConfig<T>, private insertValues:DataTypes[], protected sheetName:T[number]['sheetName'], queryQueue:InsertQueryQueueType[]){
        super(config, InsertBuilder)
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
        this.saveCurrentQueryToQueue();
        const tasks = this.queryQueue.map(q =>
          this.config.spread.API.spreadsheets.values.append({
            spreadsheetId: this.config.spread.ID,
            valueInputOption: "RAW",
            range: q.sheetName,
            requestBody: { values: [q.insertValues] },
          })
        );
      
        const responses = await Promise.all(tasks);
      
        return responses.map(res => {
          if (res.status !== 200) throw Error("error");
          return res.data.updates?.updatedRows;
        });
      }
}