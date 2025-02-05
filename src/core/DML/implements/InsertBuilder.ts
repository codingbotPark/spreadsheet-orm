import ChainQueryBuilder, { BasicQueryQueueType } from "../abstracts/AndAble";
import SpreadsheetConfig from "config/SpreadsheetConfig";
import { DataTypes, InputValueType } from "core/DDL/SchemaManager";

interface InsertQueueType extends BasicQueryQueueType{
    insertValues:DataTypes[]
}

class InsertBuilder<T extends {sheetName?:string}> extends ChainQueryBuilder<typeof InsertBuilder>{
    protected sheetName?: T["sheetName"]
    
    protected queryQueue: InsertQueueType[] = [];

    protected createQueryForQueue(this:InsertBuilder<T & {sheetName:string}>): InsertQueueType {
        // Implementation for creating a query for the queue
        return {
            // Example structure, adjust as needed
            sheetName:this.sheetName,
            insertValues:this.insertValues
        };
    }

    into(sheetName: string) {
        this.sheetName = sheetName;
        const instance = new InsertBuilder<T & {sheetName:string}>(this.config, this.insertValues)
        Object.assign(instance, this)
        return instance;
    }


    async execute(this:InsertBuilder<T & {sheetName:string}>) {
        this.saveCurrentQueryToQueue();

        // append 대신 update 로 한 번에 api query 최적화 가능
        const results = []
        for (let i = 0 ; i < this.queryQueue.length ; i++){
            const response = await this.config.spreadsheetAPI.spreadsheets.values.append({
                spreadsheetId:this.config.spreadsheetID,
                valueInputOption:"RAW",
                range:this.queryQueue[i].sheetName,
                requestBody:{
                    values:[this.queryQueue[i].insertValues]
                }
            })
            if (response.status !== 200) throw Error("error")
            results.push(response.data.updates?.updatedRows) 
        }
        return results
    }


    constructor(config: SpreadsheetConfig, private insertValues:DataTypes[]) {
        super(config);
    }

}

export default InsertBuilder