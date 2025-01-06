import createSpreadsheetConnection from "connection/createConnection";
import credentials from "../security/credentials.json"

const connectionParameters:Credentials = credentials

export interface Credentials {
    client_email: string;
    spreadsheetID: string;
    private_key: string;
}

const connection = createSpreadsheetConnection({
    email:connectionParameters.client_email,
    privateKey:connectionParameters.private_key,
    spreadsheetID:connectionParameters.spreadsheetID
})
