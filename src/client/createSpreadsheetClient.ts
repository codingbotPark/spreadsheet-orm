import SpreadsheetClient from "client/SpreadsheetClient";
import SpreadsheetConfig, { SpreadsheetConfigOptions } from "config/SpreadsheetConfig";
import { SchemaConfig } from "core/DDL/SchemaManager";
import QueryBuilder from "core/DML/QueryBuilder";

interface ClientOptions extends SpreadsheetConfigOptions, SchemaConfig{}

function createSpreadsheetClient(opts:ClientOptions){
    const config = new SpreadsheetConfig(opts)
    const queryBuilder = new QueryBuilder(config)
    const client = new SpreadsheetClient(config, queryBuilder)
    return client
}


export default createSpreadsheetClient