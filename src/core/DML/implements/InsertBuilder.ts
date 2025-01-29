import { sheets_v4 } from "googleapis";
import BaseBuilder from "../abstracts/BaseBuilder";
import assertNotNull from "interface/assertType";
import ChainQueryBuilder, { BasicQueryQueueType } from "../abstracts/ChainQueryBuilder";
import SpreadsheetConfig from "config/SpreadsheetConfig";


class InsertBuilder extends ChainQueryBuilder<Promise<number>, BasicQueryQueueType>{
    protected queryQueue: BasicQueryQueueType[] = [];

    protected createQueryForQueue(): BasicQueryQueueType {
        assertNotNull(this.sheetName);
        // Implementation for creating a query for the queue
        return {
            // Example structure, adjust as needed
            sheetName: this.sheetName,

        };
    }

    into(sheetName: string): this {
        this.sheetName = sheetName;
        return this;
    }


    async execute(): Promise<number> {
        assertNotNull(this.sheetName);

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