import ClientConfig from "@src/config/ClientConfig";

export type QueryBuilderConfig = Pick<ClientConfig, 'spread' | 'sheet'>
export type SchemaManagerConfig = Pick<ClientConfig, 'spread' | 'schema'>