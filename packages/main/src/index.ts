// import createSpreadsheetClient from './client/createSpreadsheetClient';
// export default createSpreadsheetClient

import createSpreadsheetClient from "./client/createSpreadsheetClient";
import SpreadsheetConfig from "./config/SpreadConfig";
export default createSpreadsheetClient
export { SpreadsheetConfig };

// Types
export type { SpreadsheetConfigOptions } from './config/SpreadConfig';
export type { DataTypes } from "./core/DDL/abstracts/BaseFieldBuilder"
export type { Credentials } from "./types/Credentials.ts"

