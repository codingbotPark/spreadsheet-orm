import Configs from "@src/config/Configs";
import Schema from "@src/core/DDL/implements/Schema";

export type QueryBuilderConfig<T extends Schema[]> = Pick<Configs<T>, 'spread' | 'sheet'| 'schema'>
export type SchemaManagerConfig<T extends Schema[]> = Pick<Configs<T>, 'spread' | 'schema' | 'sheet'>