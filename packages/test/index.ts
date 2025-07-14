import createSpreadsheetClient, { Credentials, defineTable, fieldBuilder } from "spreadsheet-orm"
import credentials from "./security/credentials.json" with {type:"json"}

const connectionParameters:Credentials = credentials

const userSchemaFields = {
    name:fieldBuilder.string().build(),
    age:fieldBuilder.number().build(),
}

const userSchema = defineTable("user", userSchemaFields)

const carSchemaFieldsd = {
    name:fieldBuilder.string().build(),
    displacement:fieldBuilder.number().build(),
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
    // email:connectionParameters.client_email,
    // privateKey:connectionParameters.private_key,
    // spreadsheetID:connectionParameters.spreadsheetID,
    schemas,
})

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
// 1. 타입 선언
// 1. Person 타입

// 1. Person 클래스 정의
// 메타데이터용 타입
