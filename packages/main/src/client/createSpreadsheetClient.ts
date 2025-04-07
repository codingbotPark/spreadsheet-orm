import SpreadsheetClient from "@src/client/SpreadsheetClient";
import ClientConfig, { ClientOptions } from "@src/config/ClientConfig";
import SchemaManager from "@src/core/DDL/SchemaManager";
import QueryBuilder from "@src/core/DML/QueryBuilder";

function createSpreadsheetClient(opts:ClientOptions){
    const clientConfig = new ClientConfig(opts)
    
    const queryBuilder = new QueryBuilder(clientConfig)
    const schemaManager = new SchemaManager(clientConfig)

    const client = new SpreadsheetClient(clientConfig, queryBuilder)
    return client
}


export default createSpreadsheetClient