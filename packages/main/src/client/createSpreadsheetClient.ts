import SpreadsheetClient from "@src/client/SpreadsheetClient";
import SpreadsheetConfig, { SpreadsheetConfigOptions } from "@src/config/SpreadsheetConfig";
import { SchemaConfig } from "@src/core/DDL/SchemaManager";
import QueryBuilder from "@src/core/DML/QueryBuilder";

interface ClientOptions extends SpreadsheetConfigOptions, SchemaConfig{}

function createSpreadsheetClient(opts:ClientOptions){
    const config = new SpreadsheetConfig(opts)
    const queryBuilder = new QueryBuilder(config)
    const client = new SpreadsheetClient(config, queryBuilder)
    return client
}


export default createSpreadsheetClient