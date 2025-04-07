import SchemaConfig, { SchemaConfigOptions } from "./SchemaConfig";
import SpreadConfig, { SpreadsheetConfigOptions } from "./SpreadConfig";
import SheetConfig from "./SheetConfig";

export interface ClientOptions extends SpreadsheetConfigOptions, SchemaConfigOptions{}


class ClientConfig {
    readonly spread: SpreadConfig
    readonly sheet: SheetConfig
    readonly schema: SchemaConfig
  
    constructor(opts: ClientOptions) {
      this.spread = new SpreadConfig(opts)
      this.sheet = new SheetConfig(opts)
      this.schema = new SchemaConfig(opts)
    }
    
    // proxy
    // get projectId() {
    //   return this.spreadsheet.projectId
    // }
}

export default ClientConfig