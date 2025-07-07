import SchemaConfig, { SchemaConfigOptions, SchemaConfigOptionsWithoutSchema, SchemaConfigOptionsWithSchema, SettedSchemaConfig } from "./SchemaConfig";
import SpreadConfig, { SpreadsheetConfigOptions } from "./SpreadConfig";
import SheetConfig, { SheetConfigOptions } from "./SheetConfig";
import Schema from "@src/core/DDL/implements/Schema";

export interface ClinetOptions<T extends Schema[]> extends SpreadsheetConfigOptions, SheetConfigOptions, SchemaConfigOptions<T> {}
export interface ClientOptionsWithoutSchemas extends SpreadsheetConfigOptions, SheetConfigOptions, SchemaConfigOptionsWithoutSchema{}
export interface ClinetOptionsWithSchemas<T extends Schema[]> extends SpreadsheetConfigOptions, SheetConfigOptions, SchemaConfigOptionsWithSchema<T>{}

class Configs<T extends Schema[]>{
  readonly spread:SpreadConfig
  readonly sheet:SheetConfig
  readonly schema:SchemaConfig<T>
  constructor(opts:ClinetOptions<T>){
    this.spread = new SpreadConfig(opts)
    this.sheet = new SheetConfig(opts)
    this.schema = new SchemaConfig(opts)
  } 
}

export default Configs

export class ConfigsWithSchemas<T extends Schema[]> extends Configs<T>{
    readonly schema: SettedSchemaConfig<T>;
    constructor(opts:ClinetOptionsWithSchemas<T>) {
      super(opts)
      this.schema = new SettedSchemaConfig(opts)
    }
}



