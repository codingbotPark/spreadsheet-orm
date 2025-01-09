import SpreadsheetConfig, { SpreadsheetConfigOptions } from "config/SpreadsheetConfig";
import { sheets_v4 } from "googleapis";
import { GaxiosError } from "gaxios";
import QueryBuilder from "queryBuilder/QueryBuilder";

class SpreadsheetClient{
    spreadsheetAPI:sheets_v4.Sheets
    spreadsheetID:string

    private spreadsheetInfo:sheets_v4.Schema$Spreadsheet | null = null

    constructor(private config:SpreadsheetConfig, public queryBuilder:QueryBuilder){
        this.spreadsheetAPI = config.spreadsheetAPI
        this.spreadsheetID = config.spreadsheetID
    }

    async getSpreadsheetInfo({cached}:{cached:boolean}={cached:false}){
        if (cached && this.spreadsheetInfo) return this.spreadsheetInfo
        const spreadsheetID = this.config.spreadsheetID

        try {
            this.config.spreadsheetAPI.spreadsheets.values
            const response = await this.config.spreadsheetAPI.spreadsheets.get({spreadsheetId:spreadsheetID});
            // 스프레드시트가 유효하면 response를 처리
            this.spreadsheetInfo = response.data
        } catch (error) {
            if (error instanceof GaxiosError){
                const status = error.status
                const message = error.response?.data.error.message

                if (status === 404){
                    throw new Error(`cannot find spreadsheet with (ID:${spreadsheetID})`)
                } else if (status === 403){
                    throw new Error(`forbidden spreadsheet with (ID:${spreadsheetID})`)
                } else {
                    throw new Error(`Error fetching spreadsheet: ${status} - ${message}`)
                }
            }
        }
    }

    async query(sql:string, values:[string | number]){

    }
    
    
    test(){
        
    }
}

interface spreadsheetclientOpts{
   config:SpreadsheetConfig
}

export default SpreadsheetClient