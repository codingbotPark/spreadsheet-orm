import SpreadsheetConfig from "config/SpreadsheetConfig";
import SelectBuilderWithoutFrom from "./implements/SelectBuilder";
import UpdateBuilder, { UpdateValueType } from "./implements/UpdateBuilder";
import DeleteBuilder from "./implements/DeleteBuilder";
import InsertBuilder from "./implements/InsertBuilder";

class QueryBuilder {
    constructor(private config: SpreadsheetConfig) {}


    insert(insertValues:string[]){
        return new InsertBuilder(this.config,insertValues)
    }
    
    select(...targetColumn:string[]){
        return new SelectBuilderWithoutFrom(this.config, targetColumn)
    }   

    update(updateValues:UpdateValueType){
        return new UpdateBuilder(this.config, updateValues)
    }

    delete(){
        return new DeleteBuilder(this.config)
    }


}

export default QueryBuilder;