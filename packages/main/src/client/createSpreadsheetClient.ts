import SpreadsheetClient from "@src/client/SpreadsheetClient";
import BaseConfig from "@src/config/BaseConfig";
import SchemaConfig, { SchemaConfigOptions } from "@src/config/SchemaConfig";
import SpreadsheetConfig, { SpreadsheetConfigOptions } from "@src/config/SpreadsheetConfig";
import QueryBuilder from "@src/core/DML/QueryBuilder";
import applyMixins from "@src/types/mixin";

export interface ClientOptions extends SpreadsheetConfigOptions, SchemaConfigOptions{}
export interface ClientConfig extends SpreadsheetConfig, SchemaConfig{}
export class ClientConfig extends BaseConfig{}
applyMixins(ClientConfig, [SpreadsheetConfig, SchemaConfig])

function createSpreadsheetClient(opts:ClientOptions){
    const clientConfig = new ClientConfig(opts)

    const queryBuilder = new QueryBuilder(clientConfig)
    const client = new SpreadsheetClient(clientConfig, queryBuilder)
    return client
}


export default createSpreadsheetClient