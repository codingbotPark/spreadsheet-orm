import createSpreadsheetClient from "client/createSpreadsheetClient";
import credentials from "../security/credentials.json"

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



const result = await spreadsheetClient.queryBuilder.select().from("class").execute()
console.log(result)