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

    /**
     * instance properties
     */
    
    spreadsheetID:string;
    authJWT: InstanceType<typeof google.auth.JWT>;
    spreadsheetAPI: sheets_v4.Sheets;

    constructor(options:SpreadsheetConfigOptions){
        this.checkFormat(options)
        this.spreadsheetID = SpreadsheetConfig.extractSheetIDfromURL(options.spreadsheetID) || options.spreadsheetID 
        this.authJWT = SpreadsheetConfig.makeAuthJWT({email:options.email, privateKey:options.privateKey}) 
        this.spreadsheetAPI = google.sheets({
            version:'v4',
            auth:this.authJWT
        })
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