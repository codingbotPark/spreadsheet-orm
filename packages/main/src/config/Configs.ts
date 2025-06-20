import SchemaConfig, { SchemaConfigOptions } from "./SchemaConfig";
import SpreadConfig, { SpreadsheetConfigOptions } from "./SpreadConfig";
import SheetConfig, { SheetConfigOptions } from "./SheetConfig";
import Schema from "@src/core/DDL/implements/Schema";

export interface ClientOptions<T extends Schema[]> extends SpreadsheetConfigOptions, SchemaConfigOptions<T>, SheetConfigOptions {}

class Configs<T extends Schema[] = Schema[]>{
    readonly spread: SpreadConfig
    readonly sheet: SheetConfig
    readonly schema: SchemaConfig<T>
  
    constructor(opts: ClientOptions<T>) {
      this.spread = new SpreadConfig(opts)
      this.sheet = new SheetConfig(opts)
      this.schema = new SchemaConfig(opts)
    }
    
    // proxy
    // get projectId() {
    //   return this.spreadsheet.projectId
    // }
}

export default Configs