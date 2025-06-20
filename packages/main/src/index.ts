// import createSpreadsheetClient from './client/createSpreadsheetClient';
// export default createSpreadsheetClient

import { SchemaMap } from "dist/config/SchemaConfig";
import createSpreadsheetClient from "./client/createSpreadsheetClient";
import SpreadsheetConfig from "./config/SpreadConfig";
import defineTable from "./core/DDL/defineTable";
export default createSpreadsheetClient
export { SpreadsheetConfig };

// Types
export type { SpreadsheetConfigOptions } from './config/SpreadConfig';
export type { DataTypes } from "./core/DDL/abstracts/BaseFieldBuilder"
export type { Credentials } from "./types/Credentials.ts"

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

// ↑ 여기서 "user", "car" 키가 보이면 OK


const spreadsheetClient = createSpreadsheetClient({
    email:"fdf",
    privateKey:"dfdf",
    spreadsheetID:"dfdf",
    schemas
})

spreadsheetClient.configs.schema.schemaMap.cars.fields.displacement

const test3 = await spreadsheetClient.queryBuilder.insert(["string", "number", "3"])
const result3 = await spreadsheetClient.queryBuilder.insert(["1", "2", "3"]).into("c")
  