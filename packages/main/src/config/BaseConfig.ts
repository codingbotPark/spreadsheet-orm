import { ClientOptions } from "@src/client/createSpreadsheetClient";


abstract class BaseConfig{
    constructor(protected configOptions:ClientOptions){

    }
}

export  default BaseConfig