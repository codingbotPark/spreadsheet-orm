import BaseConnection from "./SpreadsheetClient";

class PromiseSpreadsheetConnection{
    connection:BaseConnection
    promiseImpl:PromiseConstructor   

    constructor(connection: BaseConnection, promiseImpl:PromiseConstructor){
        this.connection = connection;
        this.promiseImpl = promiseImpl
    }

    
}

export default PromiseSpreadsheetConnection