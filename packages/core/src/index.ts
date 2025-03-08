// src/index.ts
export { default as createSpreadsheetClient } from './client/createSpreadsheetClient'; 
export { default as SpreadsheetClient } from './client/SpreadsheetClient';

// Types
export type { SpreadsheetConfigOptions } from './config/SpreadsheetConfig';
export type { SchemaConfig } from './core/DDL/SchemaManager';
export type { DataTypes } from './core/DDL/SchemaManager';
export type { Credentials } from "./types/Credentials"