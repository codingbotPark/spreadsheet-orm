import { GaxiosError } from "gaxios";
import { google, sheets_v4 } from "googleapis";

export interface SpreadConfigOptions{
    spreadsheetID:string;
    email: string; // service acount email
    privateKey: string; // Google API key
}

class SpreadConfig{
    static makeAuthJWT({email, privateKey}:Pick<SpreadConfigOptions, 'email' | 'privateKey'>){
       return new google.auth.JWT({
        email,
        key:privateKey,
        scopes:['https://www.googleapis.com/auth/spreadsheets']
       }) 
    }

    static extractSheetIDfromURL(url:string):SpreadConfigOptions['spreadsheetID'] | false{
        const regex = /\/d\/([a-zA-Z0-9_-]{43})/; // extract sheet id from url
        const match = url.match(regex);
        if (match && match[1]) {
            return match[1];
        } 
        return false
    }


    /**
     * instance properties
     */
    ID:string;
    authJWT: InstanceType<typeof google.auth.JWT>;
    API: sheets_v4.Sheets;
    info:sheets_v4.Schema$Spreadsheet | null = null

    constructor(options:SpreadConfigOptions){
        this.checkFormat(options)
        this.ID = SpreadConfig.extractSheetIDfromURL(options.spreadsheetID) || options.spreadsheetID 
        this.authJWT = SpreadConfig.makeAuthJWT({email:options.email, privateKey:options.privateKey}) 
        this.API = google.sheets({
            version:'v4',
            auth:this.authJWT
        })
    }

    async getSpreadInfo({cached}:{cached:boolean}={cached:false}):Promise<sheets_v4.Schema$Spreadsheet>{
        if (cached && this.info) return this.info
        const spreadsheetID = this.ID

        try {
            this.API.spreadsheets.values
            const response = await this.API.spreadsheets.get({spreadsheetId:spreadsheetID});
            // 스프레드시트가 유효하면 response를 처리
            this.info = response.data
            return this.info 
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
            throw new Error(`Unexpected error: ${(error as Error).message}`);
        }
    }

    private checkFormat(options:SpreadConfigOptions){
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

export default SpreadConfig