import Config from "@src/config/Configs";
import Schema from "@src/core/DDL/implements/Schema";

export type QueryBuilderConfig<T extends readonly Schema[] = readonly Schema[]> = Pick<Config<T>, 'spread' | 'sheet'>
export type SchemaManagerConfig<T extends readonly Schema[]> = Pick<Config<T>, 'spread' | 'schema' | 'sheet'>