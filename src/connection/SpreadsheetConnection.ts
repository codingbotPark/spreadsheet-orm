import BaseConnection from "./BaseConnection"
import PromiseSpreadsheetConnection from "./PromiseSpreadsheetConnection"

class SpreadsheetConnection extends BaseConnection{

    // to provide promise connection
    // promise connection help you to interact many time with one connection
    async promise(promiseImpl:PromiseConstructor){
        return new PromiseSpreadsheetConnection(this, promiseImpl)
    }

} 

export default SpreadsheetConnection