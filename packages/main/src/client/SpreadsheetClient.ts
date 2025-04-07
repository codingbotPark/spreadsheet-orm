import SpreadsheetConfig from "@src/config/SpreadConfig";
import { sheets_v4 } from "googleapis";
import QueryBuilder from "@src/core/DML/QueryBuilder";
import ClientConfig from "@src/config/ClientConfig";

// serve method to user 
class SpreadsheetClient{
    spreadsheetAPI:sheets_v4.Sheets
    spreadsheetID:string


    constructor(private config:ClientConfig, public queryBuilder:QueryBuilder){
        this.spreadsheetAPI = config.spread.API
        this.spreadsheetID = config.spread.ID
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
        // return this.spreadsheetAPI.spreadsheets.values.get({
        //     spreadsheetId:this.spreadsheetID,
        //     range:"class!A1:B3"
        // })
    }
}


export default SpreadsheetClient