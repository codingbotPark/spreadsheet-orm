import { DataTypes } from "@src/core/DDL/abstracts/BaseFieldBuilder";
import AndAble, { BasicQueryQueueType } from "../abstracts/AndAble";
import { QueryBuilderConfig } from "@src/types/configPicks";
import Schema from "@src/core/DDL/implements/Schema";
import BaseBuilder from "../abstracts/BaseBuilder";

interface InsertQueueType extends BasicQueryQueueType{
    insertValues:DataTypes[]
}

// class InsertBuilder<T extends Schema[] ,Into extends {sheetName?:string}> extends AndAble<typeof InsertBuilder>{
class InsertBuilder<T extends Schema[]> extends BaseBuilder<T>{
    protected sheetName?: string

    into(sheetName: T[number]['sheetName']) {
        return new SettedInsertBuilder(this.config, this.insertValues, sheetName)
    }

    constructor(config: QueryBuilderConfig<T>, private insertValues:DataTypes[]) {
        super(config);
    }

}
export default InsertBuilder



class SettedInsertBuilder<T extends Schema[]> extends AndAble<typeof InsertBuilder , InsertQueueType, T>{
    protected sheetName: string;
    constructor(config:QueryBuilderConfig<T>, private insertValues:DataTypes[], sheetName:string){
        super(config)
        this.sheetName = sheetName

    }

    protected createQueryForQueue(): InsertQueueType {
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