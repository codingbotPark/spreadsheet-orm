import createSpreadsheetClient from './client/createSpreadsheetClient';
export default createSpreadsheetClient

// src/index.ts
export { default as SpreadsheetConfig } from './config/SpreadsheetConfig';
// Types
export type { SpreadsheetConfigOptions } from './config/SpreadsheetConfig';
export type { SchemaConfig } from './core/DDL/SchemaManager';
export type { DataTypes } from './core/DDL/SchemaManager';
export type { Credentials } from "./types/Credentials"