import SpreadsheetClient from "@src/client/SpreadsheetClient";
import { SchemaConfigOptions } from "@src/config/SchemaConfig";
import SpreadsheetConfig, { SpreadsheetConfigOptions } from "@src/config/SpreadsheetConfig";
import QueryBuilder from "@src/core/DML/QueryBuilder";

interface ClientOptions extends SpreadsheetConfigOptions, SchemaConfigOptions{}

function createSpreadsheetClient(opts:ClientOptions){
    const config = new SpreadsheetConfig(opts)
    const queryBuilder = new QueryBuilder(config)
    const client = new SpreadsheetClient(config, queryBuilder)
    return client
}


export default createSpreadsheetClient