import { sheets_v4 } from "googleapis";
import QueryBuilder from "@src/core/DML/QueryBuilder";
import SchemaManager from "@src/core/DDL/SchemaManager";
import Schema from "@src/core/DDL/implements/Schema";
import Configs, { ConfigsWithSchemas } from "@src/config/Configs";

export class SpreadsheetClientWithoutSchemas{
    spreadsheetAPI: sheets_v4.Sheets
    spreadsheetID: string
    constructor(
        public configs:Configs<Schema[]>,
        public queryBuilder:QueryBuilder  
    ){
        this.spreadsheetAPI = this.configs.spread.API
        this.spreadsheetID = this.configs.spread.ID
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

export class SpreadsheetClientWithSchemas<T extends Schema[]> extends SpreadsheetClientWithoutSchemas{
    constructor(
        public configs: ConfigsWithSchemas<T>,
        public queryBuilder: QueryBuilder<T>,
        public schemaManager: SchemaManager<T>
    ){
        super(configs,queryBuilder)
    }
}
