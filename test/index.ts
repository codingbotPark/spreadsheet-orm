import createSpreadsheetClient from "client/createSpreadsheetClient";
import credentials from "../security/credentials.json"
import { ConditionedDataWithIdx } from "core/DML/abstracts/ConditionBuilder";

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

const result2 = await spreadsheetClient.queryBuilder.update(['2']).from("class").where((data:ConditionedDataWithIdx) => data[2] === "Bruno").execute()
console.log(result2)

const result3 = await spreadsheetClient.queryBuilder.insert(["1", "2", "3"]).into("class").execute()
console.log(result3)

const result4 = await spreadsheetClient.queryBuilder.delete().from("class").where((data:ConditionedDataWithIdx) => data[2] === "Bruno").execute()
console.log(result4)