import SchemaConfig, { SchemaConfigOptions } from "./SchemaConfig";
import SpreadConfig, { SpreadsheetConfigOptions } from "./SpreadConfig";
import SheetConfig, { SheetConfigOptions } from "./SheetConfig";
import Schema from "@src/core/DDL/implements/Schema";

// export interface ClientOptions<T extends Schema[] = Schema[]> extends SpreadsheetConfigOptions, SchemaConfigOptions<T>, SheetConfigOptions {}

export interface ClientOptionsWithoutSchemas extends SpreadsheetConfigOptions, SheetConfigOptions{}
export type ClientOptions<T extends Schema[]> =
  ClientOptionsWithoutSchemas & SchemaConfigOptions<T>;

export class ConfigsWithoutSChemas{
  readonly spread:SpreadConfig
  readonly sheet:SheetConfig
  constructor(opts:ClientOptionsWithoutSchemas){
    this.spread = new SpreadConfig(opts)
    this.sheet = new SheetConfig(opts)
  }
}

class Configs<T extends Schema[]> extends ConfigsWithoutSChemas{
    readonly schema: SchemaConfig<T>;

    constructor(opts:ClientOptions<T>) {
      super(opts)
      this.schema = new SchemaConfig(opts)
    }
}

export default Configs



