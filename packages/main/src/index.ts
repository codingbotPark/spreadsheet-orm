// import createSpreadsheetClient from './client/createSpreadsheetClient';
// export default createSpreadsheetClient

import createSpreadsheetClient from "./client/createSpreadsheetClient";
import SpreadsheetConfig from "./config/SpreadsheetConfig";
export default createSpreadsheetClient
export { SpreadsheetConfig };

// Types
export type { SpreadsheetConfigOptions } from './config/SpreadsheetConfig.ts';
export type { SchemaConfig } from './core/DDL/defineTable';
export type { DataTypes } from './core/DDL/defineTable';
export type { Credentials } from "./types/Credentials.ts"

