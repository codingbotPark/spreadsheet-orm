import SchemaManager from "@src/core/DDL/SchemaManager";
import QueryBuilder from "@src/core/DML/QueryBuilder";
import Schema from "@src/core/DDL/implements/Schema";
import Configs, { ClientOptionsWithoutSchemas, ClinetOptionsWithSchemas, ConfigsWithSchemas } from "@src/config/Configs";
import { SpreadsheetClientWithoutSchemas, SpreadsheetClientWithSchemas } from "./SpreadsheetClient";

function createSpreadsheetClient(opts: ClientOptionsWithoutSchemas):SpreadsheetClientWithoutSchemas
function createSpreadsheetClient<T extends Schema[]>(opts: ClinetOptionsWithSchemas<T>):SpreadsheetClientWithSchemas<T>
function createSpreadsheetClient<T extends Schema[]>(opts: ClientOptionsWithoutSchemas | ClinetOptionsWithSchemas<T>) {
    let clinet:SpreadsheetClientWithSchemas<T> | SpreadsheetClientWithoutSchemas
    if (opts.schemas){
        const configs = new ConfigsWithSchemas(opts as ClinetOptionsWithSchemas<T>)
        clinet = new SpreadsheetClientWithSchemas(
            configs,
            new QueryBuilder(configs),
            new SchemaManager(configs)
        )
    } else {
        const configs = new Configs(opts)        
        clinet = new SpreadsheetClientWithoutSchemas(
            configs,
            new QueryBuilder(configs)
        )
    }

    return clinet
}

export default createSpreadsheetClient