import SpreadsheetClient from "client/SpreadsheetClient";
import SpreadsheetConfig, { SpreadsheetConfigOptions } from "config/SpreadsheetConfig";
import QueryBuilder from "core/DML/QueryBuilder";


function createSpreadsheetClient(opts:SpreadsheetConfigOptions){
    const config = new SpreadsheetConfig(opts)
    const queryBuilder = new QueryBuilder(config)
    const client = new SpreadsheetClient(config, queryBuilder)
    return client
}


export default createSpreadsheetClient