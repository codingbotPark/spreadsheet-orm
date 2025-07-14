import SchemaConfig from "./SchemaConfig";
import SpreadConfig, { SpreadsheetConfigOptions } from "./SpreadConfig";
import SheetConfig, { SheetConfigOptions } from "./SheetConfig";
import Schema from "@src/core/DDL/implements/Schema";

// `schemas` 속성을 직접 포함하는 새로운 인터페이스 정의
export interface ClinetOptions<T extends Schema[]> extends 
    SpreadsheetConfigOptions, 
    SheetConfigOptions 
{
    schemas: T; // `schemas` 속성을 직접 가집니다.
    onMissingSchema?: 'create' | 'ignore' | 'error'; // SchemaConfigOptions의 다른 속성도 가져옵니다.
}

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



