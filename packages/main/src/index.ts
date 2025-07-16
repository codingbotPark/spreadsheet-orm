import createSpreadsheetClient from './client/createSpreadsheetClient';
export default createSpreadsheetClient
export {createSpreadsheetClient}

export { default as defineTable,fieldBuilder } from "./core/DDL/defineTable"
export { default as Configs } from "./config/Configs"
// Types
export type { SpreadsheetConfigOptions } from './config/SpreadConfig';
export type { DataTypes } from "./core/DDL/abstracts/BaseFieldBuilder"
export type { Credentials } from "./types/Credentials.ts"
export type { FieldBuilder } from "./core/DDL/defineTable"
