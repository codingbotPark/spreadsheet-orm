import SchemaManager from "@src/core/DDL/SchemaManager";
import QueryBuilder from "@src/core/DML/QueryBuilder";
import Schema from "@src/core/DDL/implements/Schema";
import Configs, { ClinetOptions } from "@src/config/Configs";
import SpreadsheetClient from "./SpreadsheetClient";


function createSpreadsheetClient<T extends Schema[]>(opts: ClinetOptions<T>):SpreadsheetClient<T> {
// function createSpreadsheetClient<T extends Schema[]>(opts: {schemas:T}):SpreadsheetClient<T> {
    const config = new Configs(opts) // car
    const clinet = new SpreadsheetClient( // road
        config,
        new QueryBuilder(config),
        new SchemaManager(config)
    )

    return clinet
}

export default createSpreadsheetClient