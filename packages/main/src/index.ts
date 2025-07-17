import createSpreadsheetClient from './client/createSpreadsheetClient';
export default createSpreadsheetClient
export {createSpreadsheetClient}

export { default as defineTable,fieldBuilder, type InferTableType } from "./core/DDL/defineTable"
export { default as Configs, type ClinetOptions } from "./config/Configs"
export { default as SpreadsheetClient } from './client/SpreadsheetClient';
export { default as QueryBuilder } from './core/DML/QueryBuilder';
export { default as SchemaManager, type SyncModeType, type SyncOptions, type SyncResult } from "./core/DDL/SchemaManager";

// Core Types
export type { SpreadsheetConfigOptions } from './config/SpreadConfig';
export type { DataTypes } from "./core/DDL/abstracts/BaseFieldBuilder"
export type { Credentials } from "./types/Credentials.ts"
export type { FieldBuilder } from "./core/DDL/defineTable"
export type { default as Schema } from "./core/DDL/implements/Schema";
export type { Executable } from "./core/DML/abstracts/BaseBuilder";
