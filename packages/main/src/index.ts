// import createSpreadsheetClient from './client/createSpreadsheetClient';
// export default createSpreadsheetClient
// export { SpreadsheetConfig };

// // Types
// export type { SpreadsheetConfigOptions } from './config/SpreadConfig';
// export type { DataTypes } from "./core/DDL/abstracts/BaseFieldBuilder"
// export type { Credentials } from "./types/Credentials.ts"

import createSpreadsheetClient from "./client/createSpreadsheetClient";
import defineTable from "./core/DDL/defineTable";


const userSchema = defineTable("user", (field) => ({
    name:field.string().build(),
    age:field.number().build()
}))

const carSchema = defineTable("cars",(field) => ({
    name:field.string().build(),
    displacement:field.number().build(),
    forKey:field.reference(userSchema, "age").build(),
}))

// type Car = InferTableType<typeof carSchema.fields>

const schemas = [userSchema, carSchema]
type SheetNames = typeof schemas[number]["sheetName"]



const spreadsheetClient = createSpreadsheetClient({
    email:"fdf",
    privateKey:"dfdf",
    spreadsheetID:"dfdf",
    schemas
})

spreadsheetClient.configs.schema.schemaMap.cars.fields.displacement
// spreadsheetClient.schemaManager.config.schema.schemaMap.cars
// spreadsheetClient.queryBuilder.config.schema.schemaMap

const test3 = await spreadsheetClient.queryBuilder.insert(["string", "number", "3"]).into("cars").and(["hi"])
// const test2 = await spreadsheetClient.queryBuilder.select(["hi"]).where()
// const test1 = await spreadsheetClient.queryBuilder.delete()
// const result3 = await spreadsheetClient.queryBuilder.insert(["1", "2", "3"]).into("usfdf") // 이럴 떄 타입에러를 내는게 맞을까?
  