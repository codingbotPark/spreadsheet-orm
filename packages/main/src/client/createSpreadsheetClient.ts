import SpreadsheetClient from "@src/client/SpreadsheetClient";
import Configs, { ClientOptions } from "@src/config/Configs";
import SchemaManager from "@src/core/DDL/SchemaManager";
import QueryBuilder from "@src/core/DML/QueryBuilder";
import Schema from "@src/core/DDL/implements/Schema";

function createSpreadsheetClient<T extends readonly Schema[]>
(opts: ClientOptions & {schemas:T})
: SpreadsheetClient<T> {
    const configs = new Configs<T>(opts)
    
    const queryBuilder = new QueryBuilder(configs)
    const schemaManager = new SchemaManager<T>(configs)
    const client = new SpreadsheetClient(configs, queryBuilder, schemaManager)
    return client
}

export default createSpreadsheetClient