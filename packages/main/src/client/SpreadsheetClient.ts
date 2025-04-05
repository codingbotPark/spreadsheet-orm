import SpreadsheetConfig from "@src/config/SpreadsheetConfig";
import { sheets_v4 } from "googleapis";
import QueryBuilder from "@src/core/DML/QueryBuilder";

// serve method to user 
class SpreadsheetClient{
    spreadsheetAPI:sheets_v4.Sheets
    spreadsheetID:string


    constructor(private config:SpreadsheetConfig, public queryBuilder:QueryBuilder){
        this.spreadsheetAPI = config.spreadsheetAPI
        this.spreadsheetID = config.spreadsheetID
    }

    


    query():QueryBuilder;
    query(sql:string, values:[string | number]):Promise<void>
    query(sql?:string):Promise<any>
    query(sql?:string, values?:[string | number]):Promise<any> | QueryBuilder{
        if (sql === undefined){
            return this.queryBuilder
        }

        return this.executeSql(sql, values)
    }
    async executeSql(sql:string, values?:[string | number]):Promise<any>{
        return this.spreadsheetAPI.spreadsheets.values.get({
            spreadsheetId:this.spreadsheetID,
            range:"class!A1:B3"
        })
    }
}


export default SpreadsheetClient