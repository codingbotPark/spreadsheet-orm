import SpreadsheetConfig from "config/SpreadsheetConfig";
import SelectBuilder from "./implements/SelectBuilder";
import UpdateBuilder, { UpdateValueType } from "./implements/UpdateBuilder";
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

    update(updateValues:UpdateValueType){
        return new UpdateBuilder(this.config, updateValues)
    }

    delete(){
        return new DeleteBuilder(this.config)
    }


}

export default QueryBuilder;