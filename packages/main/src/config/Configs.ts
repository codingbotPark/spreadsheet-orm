import SchemaConfig, { SchemaConfigOptions } from "./SchemaConfig";
import SpreadConfig, { SpreadsheetConfigOptions } from "./SpreadConfig";
import SheetConfig, { SheetConfigOptions } from "./SheetConfig";
import Schema from "@src/core/DDL/implements/Schema";

export interface ClientOptions extends SpreadsheetConfigOptions, SchemaConfigOptions, SheetConfigOptions {}

class Configs<T extends Schema[] = Schema[]>{
    readonly spread: SpreadConfig
    readonly sheet: SheetConfig
    readonly schema: SchemaConfig<T>
  
    constructor(opts: ClientOptions & {schemas:T}) {
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