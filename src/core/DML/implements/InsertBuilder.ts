import Tail from "types/Tail";
import ChainQueryBuilder, { BasicQueryQueueType } from "../abstracts/ChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";

type InsertBuilderCtorParamType = Tail<ConstructorParameters<typeof InsertBuilder>>
class InsertBuilder<T extends {sheetName?:string}> extends ChainQueryBuilder<InsertBuilderCtorParamType>{
    protected sheetName?: T["sheetName"]
    
    protected queryQueue: BasicQueryQueueType[] = [];

    protected createQueryForQueue(this:InsertBuilder<T & {sheetName:string}>): BasicQueryQueueType {
        // Implementation for creating a query for the queue
        return {
            // Example structure, adjust as needed
            sheetName: this.sheetName,

        };
    }

    into(sheetName: string) {
        this.sheetName = sheetName;
        const instance = new InsertBuilder<T & {sheetName:string}>(this.config, this.insertValues)
        Object.assign(instance, this)
        return instance;
    }


    async execute(this:InsertBuilder<T & {sheetName:string}>): Promise<number> {
        this.addQueryToQueue(this.createQueryForQueue());

        const response = await this.config.spreadsheetAPI.spreadsheets.values.append({
            spreadsheetId:this.config.spreadsheetID,
            valueInputOption:"RAW",
            range:this.sheetName,
            requestBody:{
                values:[this.insertValues]
            }
        })

        const result = response.data.updates?.updatedRows
        console.log(result)
        if (!result) throw Error("error")
        return result
    }

    constructor(config: SpreadsheetConfig, private insertValues:string[]) {
        super(config);
    }

}

export default InsertBuilder