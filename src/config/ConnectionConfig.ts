import { google, sheets_v4 } from "googleapis";

// export type SpreadsheetConnectionOptions = 
// | Required<Pick<ConnectionProperties, 'spreadsheetId'>> & Partial<Pick<ConnectionProperties, 'spreadsheetUrl'>>
// | Required<Pick<ConnectionProperties, 'spreadsheetUrl'>> & Partial<Pick<ConnectionProperties, 'spreadsheetId'>>;
export type SpreadsheetConnectionOptions = ConnectionProperties

export interface ConnectionProperties{
    spreadsheetID:string;
    email: string; // service acount email
    privateKey: string; // Google API key
}

class ConnectionConfig{
    static makeAuthJWT({email, privateKey}:Pick<ConnectionProperties, 'email' | 'privateKey'>){
       return new google.auth.JWT({
        email,
        key:privateKey,
        scopes:['https://www.googleapis.com/auth/spreadsheets']
       }) 
    }

    static extractSheetIDfromURL(url:string):ConnectionProperties['spreadsheetID'] | false{
        const regex = /\/d\/([a-zA-Z0-9_-]{43})/; // extract sheet id from url
        const match = url.match(regex);
        if (match && match[1]) {
            return match[1];
        } 
        return false
    }
    
    spreadsheetID:string;
    authJWT: InstanceType<typeof google.auth.JWT>;
    spreadsheetAPI: sheets_v4.Sheets;
    constructor(options:SpreadsheetConnectionOptions){
        this.checkFormat(options)
        this.spreadsheetID = ConnectionConfig.extractSheetIDfromURL(options.spreadsheetID) || options.spreadsheetID 
        this.authJWT = ConnectionConfig.makeAuthJWT({email:options.email, privateKey:options.privateKey}) 
        this.spreadsheetAPI = google.sheets({
            version:'v4',
            auth:this.authJWT
        })
    }


    private checkFormat(options:SpreadsheetConnectionOptions){
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

export default ConnectionConfig