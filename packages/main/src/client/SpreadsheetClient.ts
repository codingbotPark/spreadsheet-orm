import { sheets_v4 } from "googleapis";
import QueryBuilder from "@src/core/DML/QueryBuilder";
import ClientConfig from "@src/config/Configs";
import SchemaManager from "@src/core/DDL/SchemaManager";
import Schema from "@src/core/DDL/implements/Schema";

// serve method to user 
class SpreadsheetClient<T extends readonly Schema[]>{
spreadsheetAPI: sheets_v4.Sheets
    spreadsheetID: string

    // config 사용자가 수정할 수 있또록 공개하는 방안
    constructor(
        public config: ClientConfig<T>,
        public queryBuilder: QueryBuilder,
        public schemaManager: SchemaManager<T>
    ){
        this.spreadsheetAPI = this.config.spread.API
        this.spreadsheetID = this.config.spread.ID
    }


    query(): QueryBuilder;
    query(sql: string, values: [string | number]): Promise<void>
    query(sql?: string): Promise<any>
    query(sql?: string, values?: [string | number]): Promise<any> | QueryBuilder {
        if (sql === undefined){
            return this.queryBuilder
        }

        return this.executeSql(sql, values)
    }
    async executeSql(sql: string, values?: [string | number]): Promise<any>{
        // return this.spreadsheetAPI.spreadsheets.values.get({
        //     spreadsheetId:this.spreadsheetID,
        //     range:"class!A1:B3"
        // })
    }

    
}


export default SpreadsheetClient