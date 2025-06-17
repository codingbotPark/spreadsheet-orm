import ClientConfig from "@src/config/Configs";
import Schema from "@src/core/DDL/implements/Schema";

export type QueryBuilderConfig = Pick<ClientConfig, 'spread' | 'sheet'>
export type SchemaManagerConfig<T extends readonly Schema[]> = Pick<ClientConfig<T>, 'spread' | 'schema' | 'sheet'>