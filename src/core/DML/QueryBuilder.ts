import SpreadsheetConfig from "config/SpreadsheetConfig";
import SelectBuilder from "./implements/SelectBuilder";
import UpdateBuilder from "./implements/UpdateBuilder";
import DeleteBuilder from "./implements/DeleteBuilder";
import InsertBuilder from "./implements/InsertBuilder";

class QueryBuilder {
    constructor(private config: SpreadsheetConfig) {}


    insert(){
        return new InsertBuilder(this.config)
    }
    
    select(...targetColumn:string[]){
        return new SelectBuilder(this.config, targetColumn)
    }   

    update(){
        return new UpdateBuilder(this.config)
    }

    delete(){
        return new DeleteBuilder(this.config)
    }


}

export default QueryBuilder;