
import ConnectionConfig, { SpreadsheetConnectionOptions } from "config/ConnectionConfig";
import SpreadsheetConnection from "./SpreadsheetConnection";

function createSpreadsheetConnection(opts:SpreadsheetConnectionOptions):SpreadsheetConnection{
    return new SpreadsheetConnection({config: new ConnectionConfig(opts)})
}

export default createSpreadsheetConnection