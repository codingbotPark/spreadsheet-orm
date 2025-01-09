import credentials from "../security/credentials.json"
import createSpreadsheetClient from "index";

const connectionParameters:Credentials = credentials

export interface Credentials {
    client_email: string;
    spreadsheetID: string;
    private_key: string;
}

const spreadsheetClient = createSpreadsheetClient({
    email:connectionParameters.client_email,
    privateKey:connectionParameters.private_key,
    spreadsheetID:connectionParameters.spreadsheetID
})
