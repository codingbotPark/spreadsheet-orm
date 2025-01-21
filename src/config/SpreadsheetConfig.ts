import { GaxiosError } from "gaxios";
import { google, sheets_v4 } from "googleapis";

export interface SpreadsheetConfigOptions{
    spreadsheetID:string;
    email: string; // service acount email
    privateKey: string; // Google API key
}

class SpreadsheetConfig{
    static makeAuthJWT({email, privateKey}:Pick<SpreadsheetConfigOptions, 'email' | 'privateKey'>){
       return new google.auth.JWT({
        email,
        key:privateKey,
        scopes:['https://www.googleapis.com/auth/spreadsheets']
       }) 
    }

    static extractSheetIDfromURL(url:string):SpreadsheetConfigOptions['spreadsheetID'] | false{
        const regex = /\/d\/([a-zA-Z0-9_-]{43})/; // extract sheet id from url
        const match = url.match(regex);
        if (match && match[1]) {
            return match[1];
        } 
        return false
    }

    // lowest = 1
    DEFAULT_RECORDING_START_ROW = 1
    // 따로 config 파일에서 사용하거나, default를 사용하거나

    /**
     * instance properties
     */
    spreadsheetID:string;
    authJWT: InstanceType<typeof google.auth.JWT>;
    spreadsheetAPI: sheets_v4.Sheets;
    spreadsheetInfo:sheets_v4.Schema$Spreadsheet | null = null

    constructor(options:SpreadsheetConfigOptions){
        this.checkFormat(options)
        this.spreadsheetID = SpreadsheetConfig.extractSheetIDfromURL(options.spreadsheetID) || options.spreadsheetID 
        this.authJWT = SpreadsheetConfig.makeAuthJWT({email:options.email, privateKey:options.privateKey}) 
        this.spreadsheetAPI = google.sheets({
            version:'v4',
            auth:this.authJWT
        })
    }

    async getSpreadsheetInfo({cached}:{cached:boolean}={cached:false}){
        if (cached && this.spreadsheetInfo) return this.spreadsheetInfo
        const spreadsheetID = this.spreadsheetID

        try {
            this.spreadsheetAPI.spreadsheets.values
            const response = await this.spreadsheetAPI.spreadsheets.get({spreadsheetId:spreadsheetID});
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


    private checkFormat(options:SpreadsheetConfigOptions){
        if (!this.isValidEmail(options.email)){
            throw Error("Invalid email format")
        }
    }
    private isValidEmail(email: string): boolean {
        // 이메일 형식에 대한 정규 표현식
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

}

export default SpreadsheetConfig