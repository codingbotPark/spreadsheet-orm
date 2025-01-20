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

spreadsheetClient.query().select()

const test = await spreadsheetClient.spreadsheetAPI.spreadsheets.values.batchGetByDataFilter({
    spreadsheetId:spreadsheetClient.spreadsheetID,
    requestBody:{
        dataFilters:[
            {
                a1Range:"class!A1:B3"
            },
            {
                a1Range:"student!A1:C2"
            },
            {
                a1Range:"class!C1:D3"
            },
        ]
    }
})

spreadsheetClient.queryBuilder.select()