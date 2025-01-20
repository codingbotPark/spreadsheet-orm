import SpreadsheetConfig from "config/SpreadsheetConfig";

abstract class BaseBuilder<ExecuteReturn = void>{
    constructor(protected config:SpreadsheetConfig){}
    protected sheetName:string | null = null
    abstract execute():ExecuteReturn
    
}

export default BaseBuilder