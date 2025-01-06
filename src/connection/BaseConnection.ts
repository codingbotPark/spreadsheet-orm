import ConnectionConfig from "config/ConnectionConfig";
import EventEmitter from "events";
import { sheets_v4 } from "googleapis";
import { GaxiosError } from "gaxios";

class BaseConnection extends EventEmitter{
    config:ConnectionConfig
    spreadsheet:sheets_v4.Schema$Spreadsheet | null = null

    constructor(opts:baseConnectionOpts){
        super()
        this.config = opts.config
        this.setSpreadsheet(opts.config.spreadsheetID, opts.config.spreadsheetAPI)
    }

    private async setSpreadsheet(spreadsheetID:string, spreadsheetAPI:sheets_v4.Sheets){
        try {
            const response = await spreadsheetAPI.spreadsheets.get({spreadsheetId: spreadsheetID});
            // 스프레드시트가 유효하면 response를 처리
            this.spreadsheet = response.data
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
}

interface baseConnectionOpts{
   config:ConnectionConfig
}

export default BaseConnection