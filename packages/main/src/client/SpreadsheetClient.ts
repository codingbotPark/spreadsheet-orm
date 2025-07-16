import { sheets_v4 } from "googleapis";
import QueryBuilder from "@src/core/DML/QueryBuilder";
import SchemaManager from "@src/core/DDL/SchemaManager";
import Schema from "@src/core/DDL/implements/Schema";
import Configs from "@src/config/Configs";

class SpreadsheetClient<T extends Schema[]>{
    spreadsheetAPI: sheets_v4.Sheets
    spreadsheetID: string
    constructor(
        public configs: Configs<T>,
        public queryBuilder: QueryBuilder<T>,
        public schemaManager: SchemaManager<T>
    ){
        this.spreadsheetAPI = this.configs.spread.API
        this.spreadsheetID = this.configs.spread.ID
    }

    query(): QueryBuilder<T>;
    query(sql: string, values: [string | number]): Promise<void>
    query(sql?: string): Promise<any>
    query(sql?: string, values?: [string | number]): Promise<any> | QueryBuilder<T> {
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