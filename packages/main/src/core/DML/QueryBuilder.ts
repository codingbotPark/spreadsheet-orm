import SelectBuilder from "./implements/SelectBuilder";
import UpdateBuilder from "./implements/UpdateBuilder";
import DeleteBuilder from "./implements/DeleteBuilder";
import InsertBuilder from "./implements/InsertBuilder";
import { DataTypes } from "../DDL/defineTable";
import { QueryBuilderConfig } from "@src/types/configPicks";

class QueryBuilder {
    constructor(private config: QueryBuilderConfig) {
    }


    insert(insertValues:DataTypes[]){
        return new InsertBuilder(this.config,insertValues)
    }
    
    select(targetColumn?:string[]){
        return new SelectBuilder(this.config, targetColumn)
    }   

    update(updateValues:DataTypes[]){
        return new UpdateBuilder(this.config, updateValues)
    }

    delete(){
        return new DeleteBuilder(this.config)
    }


}

export default QueryBuilder;