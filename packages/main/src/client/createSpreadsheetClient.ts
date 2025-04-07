import SpreadsheetClient from "@src/client/SpreadsheetClient";
import ClientConfig, { ClientOptions } from "@src/config/ClientConfig";
import TableManager from "@src/core/DDL/TableManager";
import QueryBuilder from "@src/core/DML/QueryBuilder";

function createSpreadsheetClient(opts:ClientOptions){
    const clientConfig = new ClientConfig(opts)
    
    const queryBuilder = new QueryBuilder(clientConfig.spread)
    const schemaManager = new TableManager(clientConfig.)

    const client = new SpreadsheetClient(clientConfig, queryBuilder)
    return client
}


export default createSpreadsheetClient