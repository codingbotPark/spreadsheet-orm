import Config, { ConfigsWithSchemas } from "@src/config/Configs";
import Schema from "@src/core/DDL/implements/Schema";

export type QueryBuilderConfig<T extends Schema[]> = Pick<Config<T>, 'spread' | 'sheet'| 'schema'>
export type SchemaManagerConfig<T extends Schema[]> = Pick<ConfigsWithSchemas<T>, 'spread' | 'schema' | 'sheet'>