import SchemaConfig, { SchemaConfigOptions } from "./SchemaConfig";
import SpreadConfig, { SpreadsheetConfigOptions } from "./SpreadConfig";
import SheetConfig, { SheetConfigOptions } from "./SheetConfig";
import Schema from "@src/core/DDL/implements/Schema";

export interface ClinetOptions<T extends Schema[]> extends 
    SpreadsheetConfigOptions, 
    SheetConfigOptions,
    SchemaConfigOptions<T>
    {}

class Configs<T extends Schema[]>{
  spread:SpreadConfig
  sheet:SheetConfig
  schema: SchemaConfig<T>;

  constructor(opts:ClinetOptions<T>){
    this.spread = new SpreadConfig(opts)
    this.sheet = new SheetConfig(opts)
    this.schema = new SchemaConfig(opts)
  } 
}

export default Configs



