// import createSpreadsheetClient, { Credentials } from "../main/dist"
import createSpreadsheetClient,{ Credentials } from "spreadsheet-orm"
import credentials from "./security/credentials.json"
import defineTable, { InferTableType } from "spreadsheet-orm/src/core/DDL/defineTable"

const connectionParameters:Credentials = credentials
const spreadsheetClient = createSpreadsheetClient({
    email:connectionParameters.client_email,
    privateKey:connectionParameters.private_key,
    spreadsheetID:connectionParameters.spreadsheetID
})

const testSchema = defineTable("cars",(field) => ({
    name:field.string(),
    displacement:field.number()
}))
testSchema.sheetName


type Car = InferTableType<typeof testSchema.fields>
function addCar(car:Car){
    
}


// const tt = await spreadsheetClient.queryBuilder.delete().where((data) => data[1]==="Bruno").from("student").and().where((data) => data[2]==="Bruno").from("class").execute()
// console.log(tt)
// const result = await spreadsheetClient.queryBuilder.delete().from("class")

// const test = await spreadsheetClient.queryBuilder.select().execute()
const result = await spreadsheetClient.queryBuilder.select().from("class").execute()
console.log(result)

// const test1 = await spreadsheetClient.queryBuilder.update(['2']).where((data) => data[2] === "Bruno").execute()
// const result2 = await spreadsheetClient.queryBuilder.update(['2']).from("class").where((data) => data[2] === "Bruno").execute()
// console.log(result2)

// const test3 = await spreadsheetClient.queryBuilder.insert(["1", "2", "3"]).execute()
// const result3 = await spreadsheetClient.queryBuilder.insert(["1", "2", "3"]).into("class").execute()
// console.log(result3)

// const test4 = await spreadsheetClient.queryBuilder.delete().where((data) => data[2] === "Bruno").execute()
// const result4 = await spreadsheetClient.queryBuilder.delete().from("class").where((data) => data[2] === "2").execute()
// console.log(result4)