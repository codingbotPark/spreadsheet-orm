import createSpreadsheetClient, { Credentials, defineTable, fieldBuilder } from "spreadsheet-orm"
import credentials from "./security/credentials.json"

const connectionParameters:Credentials = credentials

const userSchemaFields = {
    name:fieldBuilder.string().build(),
    age:fieldBuilder.number().build(),
}

const userSchema = defineTable("user", userSchemaFields)

const carSchemaFieldsd = {
    name:fieldBuilder.string().build(),
    displacement:fieldBuilder.number().build(),
    createdAt:fieldBuilder.date().createdTimestamp().build()
    // forKey:fieldBuilder.reference(userSchema, "age").build(),
}

const carSchema = defineTable("cars",carSchemaFieldsd) 
// const carSchema = defineTable("cars",(field:FieldBuilder) => ({
//     name:field.string().build(),
//     displacement:field.number().build(),
//     forKey:field.reference(userSchema, "age").build(),
// })) 

// type Car = InferTableType<typeof carSchema.fields>

const schemas = [userSchema, carSchema];

const spreadsheetClient = createSpreadsheetClient({
    privateKey:connectionParameters.private_key,
    email:connectionParameters.client_email,
    spreadsheetID:connectionParameters.spreadsheetID,
    // schemas:schemas
})
// spreadsheetClient.configs.schema.schemaMap.cars
// await spreadsheetClient.schemaManager.sync({mode:"force"})
// await spreadsheetClient.queryBuilder.insert(["volvo", "1960"]).into("cars").execute()
// await spreadsheetClient.queryBuilder.insert(["volvo",1960]).into("cars").execute()
// await spreadsheetClient.queryBuilder.delete().from("cars").where((data) => data[2] === "1960").execute() // index0 = index
// await spreadsheetClient.queryBuilder.update(["hyundai", 2000]).from("cars").execute()
// await spreadsheetClient.queryBuilder.insert(["volvo",1960]).into("cars").and(["hyundai", 2020]).into("cars").execute()
// // await spreadsheetClient.queryBuilder.insert(["volve", 1960]).into("cars").and()
const result = await spreadsheetClient.queryBuilder.select().from("cars").and().from("user").execute()
console.log(result)


// await spreadsheetClient.queryBuilder.update()

// const spreadsheetClient = createSpreadsheetClient(
    // email:connectionParameters.client_email,
    // privateKey:connectionParameters.private_key,
    // spreadsheetID:connectionParameters.spreadsheetID,
    // schemas:schemas
// )
// function createRoad<Person<string, FieldsType>[]>({ people, }: CreatRoadType<Person<string, FieldsType>[]>): Road<Person<string, FieldsType>[]>


